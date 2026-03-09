import { requireAdmin } from '../../lib/auth.js';
import { createServerClient } from '../../lib/supabase.js';

export default async function handler(req, res) {
  const user = await requireAdmin(req, res);
  if (!user) return;
  const db = createServerClient();

  const id = req.query.id ? parseInt(req.query.id) : null;

  // LIST
  if (!id && req.method === 'GET') {
    const { data } = await db.from('app_users').select('id, email, display_name, role, created_at, last_login');
    return res.json(data);
  }

  // CREATE
  if (!id && req.method === 'POST') {
    const { email, password, displayName, role = 'editor' } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name required' });
    }

    const { data: authData, error: authError } = await db.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (authError) return res.status(400).json({ error: authError.message });

    const { data: appUser, error } = await db.from('app_users').insert({
      supabase_uid: authData.user.id, email, display_name: displayName, role,
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ id: appUser.id, email, displayName, role });
  }

  if (!id) return res.status(405).json({ error: 'Method not allowed' });

  // UPDATE
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

  // DELETE
  if (req.method === 'DELETE') {
    if (id === user.appUser.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    await db.from('app_users').delete().eq('id', id);
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
