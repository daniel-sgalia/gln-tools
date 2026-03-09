import { requireAuth } from '../../lib/auth.js';
import { createServerClient } from '../../lib/supabase.js';
import { logChange } from '../../lib/audit.js';

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();

  if (req.method === 'GET') {
    const { data } = await db.from('cities').select('*').order('sort_order');
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { key, city_name, country, flag } = req.body;
    if (!key || !city_name || !country || !flag) {
      return res.status(400).json({ error: 'key, city_name, country, and flag are required' });
    }

    const { data: existing } = await db.from('cities').select('id').eq('key', key).single();
    if (existing) return res.status(409).json({ error: 'A city with this key already exists' });

    const { data: maxRow } = await db.from('cities').select('sort_order').order('sort_order', { ascending: false }).limit(1).single();
    const sortOrder = (maxRow?.sort_order ?? -1) + 1;

    const { data: inserted, error } = await db.from('cities').insert({
      key, city_name, country, flag, sort_order: sortOrder, is_active: true,
      updated_by: user.appUser.id,
    }).select().single();

    if (error) return res.status(500).json({ error: error.message });

    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'cities', recordId: inserted.id, recordLabel: `${city_name}, ${country}`, action: 'create' });
    return res.json({ id: inserted.id, key });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
