import { requireAdmin } from '../../lib/auth.js';
import { createServerClient } from '../../lib/supabase.js';

export default async function handler(req, res) {
  const user = await requireAdmin(req, res);
  if (!user) return;
  const db = createServerClient();

  if (req.method === 'GET') {
    const { data } = await db.from('app_users').select('id, email, display_name, role, created_at, last_login');
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { email, password, displayName, role = 'editor' } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name required' });
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await db.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (authError) return res.status(400).json({ error: authError.message });

    // Create app_users record
    const { data: appUser, error } = await db.from('app_users').insert({
      supabase_uid: authData.user.id, email, display_name: displayName, role,
    }).select().single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ id: appUser.id, email, displayName, role });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
