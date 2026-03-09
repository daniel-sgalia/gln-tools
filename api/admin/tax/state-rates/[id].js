import { requireAuth } from '../../../../lib/auth.js';
import { createServerClient } from '../../../../lib/supabase.js';
import { logChange, diffFields } from '../../../../lib/audit.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const id = parseInt(req.query.id);

  const { data: existing } = await db.from('state_tax_rates').select('*').eq('id', id).single();
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const fields = ['state_code', 'state_name', 'rate', 'local_rate', 'source', 'source_url'];
  const changes = diffFields(existing, req.body, fields);
  if (!changes) return res.json(existing);

  const updates = { updated_by: user.appUser.id, last_updated: new Date().toISOString() };
  for (const [f, { new: v }] of Object.entries(changes)) updates[f] = v;

  const { data: updated } = await db.from('state_tax_rates').update(updates).eq('id', id).select().single();
  await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'state_tax_rates', recordId: id, recordLabel: `${existing.state_name} (${existing.state_code})`, action: 'update', changes });
  res.json(updated);
}
