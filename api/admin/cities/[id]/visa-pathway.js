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
  const { visaType, processingTime, steps, source } = req.body;

  const { data: existing } = await db.from('visa_pathways').select('id').eq('city_id', cityId).single();
  let vpId;

  if (existing) {
    await db.from('visa_pathways').update({
      visa_type: visaType, processing_time: processingTime, source: source || null,
      updated_by: user.appUser.id, last_updated: new Date().toISOString(),
    }).eq('city_id', cityId);
    vpId = existing.id;
    await db.from('visa_pathway_steps').delete().eq('visa_pathway_id', vpId);
  } else {
    const { data: inserted } = await db.from('visa_pathways').insert({
      city_id: cityId, visa_type: visaType, processing_time: processingTime,
      source: source || null, updated_by: user.appUser.id,
    }).select().single();
    vpId = inserted.id;
  }

  if (steps.length) {
    await db.from('visa_pathway_steps').insert(steps.map((step, i) => ({
      visa_pathway_id: vpId, step_label: step.label, step_time: step.time,
      step_detail: step.detail, sort_order: i, updated_by: user.appUser.id,
    })));
  }

  await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'visa_pathways', recordId: cityId, recordLabel: await cityLabel(db, cityId), action: 'update', changes: { visaPathway: { old: 'bulk', new: 'updated' } } });
  res.json({ ok: true });
}
