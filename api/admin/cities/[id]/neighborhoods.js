import { requireAuth } from '../../../../lib/auth.js';
import { createServerClient } from '../../../../lib/supabase.js';
import { logChange } from '../../../../lib/audit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const cityId = parseInt(req.query.id);
  const { name, vibe, description, source } = req.body;

  const { data: inserted, error } = await db.from('neighborhoods').insert({
    city_id: cityId, name, vibe, description, source: source || null,
    updated_by: user.appUser.id,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'neighborhoods', recordId: inserted.id, recordLabel: name, action: 'create' });
  res.json(inserted);
}
