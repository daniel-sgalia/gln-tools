import { requireAuth } from '../../../../lib/auth.js';
import { createServerClient } from '../../../../lib/supabase.js';
import { logChange } from '../../../../lib/audit.js';

async function cityLabel(db, cityId) {
  const { data } = await db.from('cities').select('city_name, country').eq('id', cityId).single();
  return data ? `${data.city_name}, ${data.country}` : null;
}

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const cityId = parseInt(req.query.id);
  const { scores, source } = req.body;

  for (const [dimension, score] of Object.entries(scores)) {
    const { data: existing } = await db.from('city_scores').select('score').eq('city_id', cityId).eq('dimension', dimension).single();

    await db.from('city_scores').upsert({
      city_id: cityId, dimension, score, source: source || null, updated_by: user.appUser.id, last_updated: new Date().toISOString(),
    }, { onConflict: 'city_id,dimension' });

    if (existing && existing.score !== score) {
      await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'city_scores', recordId: cityId, recordLabel: await cityLabel(db, cityId), action: 'update',
        changes: { [dimension]: { old: existing.score, new: score } } });
    }
  }

  const { data } = await db.from('city_scores').select('*').eq('city_id', cityId);
  res.json(data);
}
