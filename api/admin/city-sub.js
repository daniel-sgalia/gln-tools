import { requireAuth } from '../../lib/auth.js';
import { createServerClient } from '../../lib/supabase.js';
import { logChange, diffFields } from '../../lib/audit.js';

async function cityLabel(db, cityId) {
  const { data } = await db.from('cities').select('city_name, country').eq('id', cityId).single();
  return data ? `${data.city_name}, ${data.country}` : null;
}

// Catch-all for /api/admin/city-sub?action=scores&id=1 (etc.)
export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const { action, id, subId } = req.query;
  const cityId = id ? parseInt(id) : null;

  // --- scores ---
  if (action === 'scores' && req.method === 'PUT') {
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
    return res.json(data);
  }

  // --- visa-origins ---
  if (action === 'visa-origins' && req.method === 'PUT') {
    const { origins } = req.body;
    for (const [origin, data_] of Object.entries(origins)) {
      await db.from('visa_by_origin').upsert({
        city_id: cityId, origin, speed: data_.speed, boost: data_.boost,
        source: data_.source || null, updated_by: user.appUser.id, last_updated: new Date().toISOString(),
      }, { onConflict: 'city_id,origin' });
    }
    const { data } = await db.from('visa_by_origin').select('*').eq('city_id', cityId);
    return res.json(data);
  }

  // --- highlights ---
  if (action === 'highlights' && req.method === 'PUT') {
    const { highlights } = req.body;
    for (const [key, text] of Object.entries(highlights)) {
      await db.from('city_highlights').upsert({
        city_id: cityId, dimension_key: key, highlight_text: text,
        updated_by: user.appUser.id, last_updated: new Date().toISOString(),
      }, { onConflict: 'city_id,dimension_key' });
    }
    const { data } = await db.from('city_highlights').select('*').eq('city_id', cityId);
    return res.json(data);
  }

  // --- schools (create) ---
  if (action === 'schools' && req.method === 'POST') {
    const { name, type, curriculum, grades, tuition_usd, note, source, source_url } = req.body;
    const { data: inserted, error } = await db.from('schools').insert({
      city_id: cityId, name, type, curriculum, grades, tuition_usd,
      note: note || null, source: source || null, source_url: source_url || null,
      updated_by: user.appUser.id,
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'schools', recordId: inserted.id, recordLabel: name, action: 'create' });
    return res.json(inserted);
  }

  // --- school (update/delete) ---
  if (action === 'school' && subId) {
    const schoolId = parseInt(subId);
    if (req.method === 'PUT') {
      const { data: school } = await db.from('schools').select('*').eq('id', schoolId).single();
      if (!school) return res.status(404).json({ error: 'School not found' });
      const fields = ['name', 'type', 'curriculum', 'grades', 'tuition_usd', 'note', 'source', 'source_url', 'sort_order'];
      const changes = diffFields(school, req.body, fields);
      if (!changes) return res.json(school);
      const updates = { updated_by: user.appUser.id, last_updated: new Date().toISOString() };
      for (const [f, { new: v }] of Object.entries(changes)) updates[f] = v;
      const { data: updated } = await db.from('schools').update(updates).eq('id', schoolId).select().single();
      await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'schools', recordId: schoolId, recordLabel: school.name, action: 'update', changes });
      return res.json(updated);
    }
    if (req.method === 'DELETE') {
      const { data: school } = await db.from('schools').select('name').eq('id', schoolId).single();
      if (!school) return res.status(404).json({ error: 'School not found' });
      await db.from('schools').delete().eq('id', schoolId);
      await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'schools', recordId: schoolId, recordLabel: school.name, action: 'delete' });
      return res.json({ ok: true });
    }
  }

  // --- neighborhoods (create) ---
  if (action === 'neighborhoods' && req.method === 'POST') {
    const { name, vibe, description, source } = req.body;
    const { data: inserted, error } = await db.from('neighborhoods').insert({
      city_id: cityId, name, vibe, description, source: source || null,
      updated_by: user.appUser.id,
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'neighborhoods', recordId: inserted.id, recordLabel: name, action: 'create' });
    return res.json(inserted);
  }

  // --- neighborhood (update/delete) ---
  if (action === 'neighborhood' && subId) {
    const nhId = parseInt(subId);
    if (req.method === 'PUT') {
      const { data: nh } = await db.from('neighborhoods').select('*').eq('id', nhId).single();
      if (!nh) return res.status(404).json({ error: 'Neighborhood not found' });
      const fields = ['name', 'vibe', 'description', 'source', 'sort_order'];
      const changes = diffFields(nh, req.body, fields);
      if (!changes) return res.json(nh);
      const updates = { updated_by: user.appUser.id, last_updated: new Date().toISOString() };
      for (const [f, { new: v }] of Object.entries(changes)) updates[f] = v;
      const { data: updated } = await db.from('neighborhoods').update(updates).eq('id', nhId).select().single();
      await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'neighborhoods', recordId: nhId, recordLabel: nh.name, action: 'update', changes });
      return res.json(updated);
    }
    if (req.method === 'DELETE') {
      const { data: nh } = await db.from('neighborhoods').select('name').eq('id', nhId).single();
      await db.from('neighborhoods').delete().eq('id', nhId);
      await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'neighborhoods', recordId: nhId, recordLabel: nh?.name, action: 'delete' });
      return res.json({ ok: true });
    }
  }

  // --- budget ---
  if (action === 'budget' && req.method === 'PUT') {
    const { items, totalRange, source } = req.body;
    await db.from('budget_breakdowns').delete().eq('city_id', cityId);
    if (items.length) {
      await db.from('budget_breakdowns').insert(items.map((item, i) => ({
        city_id: cityId, category: item.category, amount: item.amount,
        note: item.note || null, family_only: !!item.familyOnly,
        source: source || null, updated_by: user.appUser.id, sort_order: i,
      })));
    }
    await db.from('budget_totals').upsert({
      city_id: cityId, total_range: totalRange, source: source || null,
      updated_by: user.appUser.id, last_updated: new Date().toISOString(),
    }, { onConflict: 'city_id' });
    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'budget_breakdowns', recordId: cityId, recordLabel: await cityLabel(db, cityId), action: 'update', changes: { budget: { old: 'bulk', new: 'updated' } } });
    return res.json({ ok: true });
  }

  // --- visa-pathway ---
  if (action === 'visa-pathway' && req.method === 'PUT') {
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
    return res.json({ ok: true });
  }

  // --- services ---
  if (action === 'services' && req.method === 'PUT') {
    const { services } = req.body;
    await db.from('gln_services').delete().eq('city_id', cityId);
    if (services.length) {
      await db.from('gln_services').insert(services.map((s, i) => ({
        city_id: cityId, service_name: s.service, detail: s.detail,
        sort_order: i, updated_by: user.appUser.id,
      })));
    }
    return res.json({ ok: true });
  }

  // --- col ---
  if (action === 'col' && req.method === 'PUT') {
    const { housing, school, healthcare, groceries, transport, lifestyle, source } = req.body;
    await db.from('destination_col').upsert({
      city_id: cityId, housing, school, healthcare, groceries, transport, lifestyle,
      source: source || null, updated_by: user.appUser.id, last_updated: new Date().toISOString(),
    }, { onConflict: 'city_id' });
    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'destination_col', recordId: cityId, recordLabel: await cityLabel(db, cityId), action: 'update', changes: { col: { old: 'bulk', new: 'updated' } } });
    return res.json({ ok: true });
  }

  // --- tax-program ---
  if (action === 'tax-program' && req.method === 'PUT') {
    const { programName, programDesc, effectiveRate, method, bracketsRef, caveat, source } = req.body;
    await db.from('destination_tax_programs').upsert({
      city_id: cityId, program_name: programName, program_desc: programDesc,
      effective_rate: effectiveRate ?? null, method, brackets_ref: bracketsRef || null,
      caveat: caveat || null, source: source || null,
      updated_by: user.appUser.id, last_updated: new Date().toISOString(),
    }, { onConflict: 'city_id' });
    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'destination_tax_programs', recordId: cityId, recordLabel: await cityLabel(db, cityId), action: 'update', changes: { taxProgram: { old: 'bulk', new: 'updated' } } });
    return res.json({ ok: true });
  }

  res.status(400).json({ error: 'Unknown action' });
}
