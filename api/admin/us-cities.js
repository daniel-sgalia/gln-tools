import { requireAuth } from '../../lib/auth.js';
import { createServerClient } from '../../lib/supabase.js';
import { logChange } from '../../lib/audit.js';

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();

  if (req.method === 'GET') {
    const { data } = await db.from('us_cities').select('*').order('city_name');
    return res.json(data);
  }

  if (req.method === 'POST') {
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

  res.status(405).json({ error: 'Method not allowed' });
}
