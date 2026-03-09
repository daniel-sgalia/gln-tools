import { requireAdmin } from '../../../lib/auth.js';
import { createServerClient } from '../../../lib/supabase.js';

export default async function handler(req, res) {
  const user = await requireAdmin(req, res);
  if (!user) return;
  const db = createServerClient();
  const id = parseInt(req.query.id);

  if (req.method === 'PUT') {
    const { displayName, role } = req.body;
    const updates = {};
    if (displayName) updates.display_name = displayName;
    if (role) updates.role = role;

    const { data: updated } = await db.from('app_users').update(updates).eq('id', id)
      .select('id, email, display_name, role, created_at, last_login').single();
    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    if (id === user.appUser.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    await db.from('app_users').delete().eq('id', id);
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
