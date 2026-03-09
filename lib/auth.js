import { getUser, createServerClient } from './supabase.js';

export async function requireAuth(req, res) {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  const db = createServerClient();
  const { data: appUser } = await db
    .from('app_users')
    .select('*')
    .eq('supabase_uid', user.id)
    .single();
  if (!appUser) {
    res.status(403).json({ error: 'User not found in system' });
    return null;
  }
  return { ...user, appUser };
}

export async function requireAdmin(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (user.appUser.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }
  return user;
}
