import { requireAuth } from '../../../../lib/auth.js';
import { createServerClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const cityId = parseInt(req.query.id);
  const { highlights } = req.body;

  for (const [key, text] of Object.entries(highlights)) {
    await db.from('city_highlights').upsert({
      city_id: cityId, dimension_key: key, highlight_text: text,
      updated_by: user.appUser.id, last_updated: new Date().toISOString(),
    }, { onConflict: 'city_id,dimension_key' });
  }

  const { data } = await db.from('city_highlights').select('*').eq('city_id', cityId);
  res.json(data);
}
