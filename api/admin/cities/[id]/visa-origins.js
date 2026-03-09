import { requireAuth } from '../../../../lib/auth.js';
import { createServerClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const cityId = parseInt(req.query.id);
  const { origins } = req.body;

  for (const [origin, data] of Object.entries(origins)) {
    await db.from('visa_by_origin').upsert({
      city_id: cityId, origin, speed: data.speed, boost: data.boost,
      source: data.source || null, updated_by: user.appUser.id, last_updated: new Date().toISOString(),
    }, { onConflict: 'city_id,origin' });
  }

  const { data: result } = await db.from('visa_by_origin').select('*').eq('city_id', cityId);
  res.json(result);
}
