import { requireAuth } from '../../../../lib/auth.js';
import { createServerClient } from '../../../../lib/supabase.js';
import { logChange, diffFields } from '../../../../lib/audit.js';

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const nhId = parseInt(req.query.nhId);

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

  res.status(405).json({ error: 'Method not allowed' });
}
