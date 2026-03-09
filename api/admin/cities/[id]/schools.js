import { requireAuth } from '../../../../lib/auth.js';
import { createServerClient } from '../../../../lib/supabase.js';
import { logChange } from '../../../../lib/audit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const cityId = parseInt(req.query.id);
  const { name, type, curriculum, grades, tuition_usd, note, source, source_url } = req.body;

  const { data: inserted, error } = await db.from('schools').insert({
    city_id: cityId, name, type, curriculum, grades, tuition_usd,
    note: note || null, source: source || null, source_url: source_url || null,
    updated_by: user.appUser.id,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'schools', recordId: inserted.id, recordLabel: name, action: 'create' });
  res.json(inserted);
}
