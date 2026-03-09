import { requireAuth } from '../../../../lib/auth.js';
import { createServerClient } from '../../../../lib/supabase.js';
import { logChange, diffFields } from '../../../../lib/audit.js';

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const schoolId = parseInt(req.query.schoolId);

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

  res.status(405).json({ error: 'Method not allowed' });
}
