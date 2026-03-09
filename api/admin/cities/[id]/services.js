import { requireAuth } from '../../../../lib/auth.js';
import { createServerClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const cityId = parseInt(req.query.id);
  const { services } = req.body;

  await db.from('gln_services').delete().eq('city_id', cityId);
  if (services.length) {
    await db.from('gln_services').insert(services.map((s, i) => ({
      city_id: cityId, service_name: s.service, detail: s.detail,
      sort_order: i, updated_by: user.appUser.id,
    })));
  }

  res.json({ ok: true });
}
