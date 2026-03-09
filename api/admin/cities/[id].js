import { requireAuth } from '../../../lib/auth.js';
import { createServerClient } from '../../../lib/supabase.js';
import { logChange, diffFields } from '../../../lib/audit.js';

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const cityId = parseInt(req.query.id);

  if (req.method === 'GET') {
    const { data: city } = await db.from('cities').select('*').eq('id', cityId).single();
    if (!city) return res.status(404).json({ error: 'City not found' });

    const [
      { data: scores }, { data: visaByOrigin }, { data: highlights },
      { data: schools }, { data: neighborhoods }, { data: budgetBreakdowns },
      { data: budgetTotal }, { data: visaPathway }, { data: glnServices },
      { data: destinationCol }, { data: taxProgram },
    ] = await Promise.all([
      db.from('city_scores').select('*').eq('city_id', cityId),
      db.from('visa_by_origin').select('*').eq('city_id', cityId),
      db.from('city_highlights').select('*').eq('city_id', cityId),
      db.from('schools').select('*').eq('city_id', cityId).order('sort_order'),
      db.from('neighborhoods').select('*').eq('city_id', cityId).order('sort_order'),
      db.from('budget_breakdowns').select('*').eq('city_id', cityId).order('sort_order'),
      db.from('budget_totals').select('*').eq('city_id', cityId).single(),
      db.from('visa_pathways').select('*').eq('city_id', cityId).single(),
      db.from('gln_services').select('*').eq('city_id', cityId).order('sort_order'),
      db.from('destination_col').select('*').eq('city_id', cityId).single(),
      db.from('destination_tax_programs').select('*').eq('city_id', cityId).single(),
    ]);

    let visaSteps = [];
    if (visaPathway) {
      const { data } = await db.from('visa_pathway_steps').select('*').eq('visa_pathway_id', visaPathway.id).order('sort_order');
      visaSteps = data || [];
    }

    return res.json({
      ...city, scores, visaByOrigin, highlights, schools, neighborhoods,
      budgetBreakdowns, budgetTotal, visaPathway, visaSteps, glnServices,
      destinationCol, taxProgram,
    });
  }

  if (req.method === 'PUT') {
    const { data: city } = await db.from('cities').select('*').eq('id', cityId).single();
    if (!city) return res.status(404).json({ error: 'City not found' });

    const fields = ['city_name', 'country', 'flag', 'cost_of_living_index', 'safety_rating',
      'healthcare_quality', 'internet_reliability', 'expat_community', 'climate_description',
      'climate_type', 'caveat', 'source', 'source_url', 'is_active', 'sort_order'];

    const changes = diffFields(city, req.body, fields);
    if (!changes) return res.json(city);

    const updates = { updated_by: user.appUser.id, last_updated: new Date().toISOString() };
    for (const [f, { new: v }] of Object.entries(changes)) updates[f] = v;

    const { data: updated } = await db.from('cities').update(updates).eq('id', cityId).select().single();
    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'cities', recordId: cityId, recordLabel: `${city.city_name}, ${city.country}`, action: 'update', changes });
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    const { data: city } = await db.from('cities').select('*').eq('id', cityId).single();
    if (!city) return res.status(404).json({ error: 'City not found' });

    await db.from('cities').delete().eq('id', cityId);
    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'cities', recordId: cityId, recordLabel: `${city.city_name}, ${city.country}`, action: 'delete' });
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
