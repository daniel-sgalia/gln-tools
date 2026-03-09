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
  const { items, totalRange, source } = req.body;

  // Delete existing and re-insert
  await db.from('budget_breakdowns').delete().eq('city_id', cityId);
  if (items.length) {
    await db.from('budget_breakdowns').insert(items.map((item, i) => ({
      city_id: cityId, category: item.category, amount: item.amount,
      note: item.note || null, family_only: !!item.familyOnly,
      source: source || null, updated_by: user.appUser.id, sort_order: i,
    })));
  }

  // Upsert budget total
  await db.from('budget_totals').upsert({
    city_id: cityId, total_range: totalRange, source: source || null,
    updated_by: user.appUser.id, last_updated: new Date().toISOString(),
  }, { onConflict: 'city_id' });

  await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'budget_breakdowns', recordId: cityId, recordLabel: await cityLabel(db, cityId), action: 'update', changes: { budget: { old: 'bulk', new: 'updated' } } });
  res.json({ ok: true });
}
