import { requireAuth } from '../../lib/auth.js';
import { createServerClient } from '../../lib/supabase.js';
import { logChange, diffFields } from '../../lib/audit.js';

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();

  const id = req.query.id ? parseInt(req.query.id) : null;

  // LIST
  if (!id && req.method === 'GET') {
    const { data } = await db.from('us_cities').select('*').order('city_name');
    return res.json(data);
  }

  // CREATE
  if (!id && req.method === 'POST') {
    const { city_name, state_code } = req.body;
    if (!city_name || !state_code) return res.status(400).json({ error: 'City name and state code are required' });

    const { data: existing } = await db.from('us_cities').select('id').eq('city_name', city_name).single();
    if (existing) return res.status(409).json({ error: 'City already exists' });

    const { data: inserted, error } = await db.from('us_cities').insert({
      city_name, state_code, housing: 0, school: 0, healthcare: 0,
      groceries: 0, transport: 0, lifestyle: 0, updated_by: user.appUser.id,
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });

    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'us_cities', recordId: inserted.id, recordLabel: `${city_name}, ${state_code}`, action: 'create' });
    return res.json(inserted);
  }

  if (!id) return res.status(405).json({ error: 'Method not allowed' });

  // UPDATE
  if (req.method === 'PUT') {
    const { data: existing } = await db.from('us_cities').select('*').eq('id', id).single();
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const fields = ['city_name', 'state_code', 'housing', 'school', 'healthcare', 'groceries', 'transport', 'lifestyle', 'source', 'source_url'];
    const changes = diffFields(existing, req.body, fields);
    if (!changes) return res.json(existing);

    const updates = { updated_by: user.appUser.id, last_updated: new Date().toISOString() };
    for (const [f, { new: v }] of Object.entries(changes)) updates[f] = v;

    const { data: updated } = await db.from('us_cities').update(updates).eq('id', id).select().single();
    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'us_cities', recordId: id, recordLabel: `${existing.city_name}, ${existing.state_code}`, action: 'update', changes });
    return res.json(updated);
  }

  // DELETE
  if (req.method === 'DELETE') {
    const { data: city } = await db.from('us_cities').select('*').eq('id', id).single();
    if (!city) return res.status(404).json({ error: 'Not found' });

    await db.from('us_cities').delete().eq('id', id);
    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'us_cities', recordId: id, recordLabel: `${city.city_name}, ${city.state_code}`, action: 'delete' });
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
