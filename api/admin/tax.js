import { requireAuth } from '../../lib/auth.js';
import { createServerClient } from '../../lib/supabase.js';
import { logChange, diffFields } from '../../lib/audit.js';

// Handles: /api/admin/tax?action=state-rates
//          /api/admin/tax?action=state-rate&id=1
//          /api/admin/tax?action=bracket-sets
//          /api/admin/tax?action=brackets&set=federal_us

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const { action, id, set } = req.query;

  // --- List state rates ---
  if (action === 'state-rates' && req.method === 'GET') {
    const { data } = await db.from('state_tax_rates').select('*').order('state_code');
    return res.json(data);
  }

  // --- Update single state rate ---
  if (action === 'state-rate' && id && req.method === 'PUT') {
    const rateId = parseInt(id);
    const { data: existing } = await db.from('state_tax_rates').select('*').eq('id', rateId).single();
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const fields = ['state_code', 'state_name', 'rate', 'local_rate', 'source', 'source_url'];
    const changes = diffFields(existing, req.body, fields);
    if (!changes) return res.json(existing);

    const updates = { updated_by: user.appUser.id, last_updated: new Date().toISOString() };
    for (const [f, { new: v }] of Object.entries(changes)) updates[f] = v;

    const { data: updated } = await db.from('state_tax_rates').update(updates).eq('id', rateId).select().single();
    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'state_tax_rates', recordId: rateId, recordLabel: `${existing.state_name} (${existing.state_code})`, action: 'update', changes });
    return res.json(updated);
  }

  // --- List bracket sets ---
  if (action === 'bracket-sets' && req.method === 'GET') {
    const { data } = await db.from('tax_brackets').select('bracket_set').order('bracket_set');
    const sets = [...new Set((data || []).map(r => r.bracket_set))];
    return res.json(sets);
  }

  // --- Get brackets for a set ---
  if (action === 'brackets' && set && req.method === 'GET') {
    const { data } = await db.from('tax_brackets').select('*').eq('bracket_set', set).order('sort_order');
    return res.json(data);
  }

  // --- Update brackets for a set ---
  if (action === 'brackets' && set && req.method === 'PUT') {
    const { brackets, source } = req.body;

    await db.from('tax_brackets').delete().eq('bracket_set', set);
    if (brackets.length) {
      await db.from('tax_brackets').insert(brackets.map((b, i) => ({
        bracket_set: set, min_income: b.min,
        max_income: b.max === Infinity || b.max === null ? null : b.max,
        rate: b.rate, source: source || null, updated_by: user.appUser.id, sort_order: i,
      })));
    }

    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'tax_brackets', recordId: 0, recordLabel: `${set} brackets`, action: 'update', changes: { [set]: { old: 'bulk', new: 'updated' } } });
    const { data } = await db.from('tax_brackets').select('*').eq('bracket_set', set).order('sort_order');
    return res.json(data);
  }

  res.status(400).json({ error: 'Unknown action' });
}
