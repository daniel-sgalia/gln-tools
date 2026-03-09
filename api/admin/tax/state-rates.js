import { requireAuth } from '../../../lib/auth.js';
import { createServerClient } from '../../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const { data } = await db.from('state_tax_rates').select('*').order('state_code');
  res.json(data);
}
