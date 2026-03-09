import { requireAuth } from '../../../lib/auth.js';
import { createServerClient } from '../../../lib/supabase.js';
import { logChange, diffFields } from '../../../lib/audit.js';

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const id = parseInt(req.query.id);

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

  if (req.method === 'DELETE') {
    const { data: city } = await db.from('us_cities').select('*').eq('id', id).single();
    if (!city) return res.status(404).json({ error: 'Not found' });

    await db.from('us_cities').delete().eq('id', id);
    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'us_cities', recordId: id, recordLabel: `${city.city_name}, ${city.state_code}`, action: 'delete' });
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
