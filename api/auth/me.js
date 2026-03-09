import { requireAuth } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req, res);
  if (!user) return;

  res.json({
    id: user.appUser.id,
    email: user.email,
    displayName: user.appUser.display_name,
    role: user.appUser.role,
  });
}
