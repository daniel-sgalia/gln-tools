import { requireAuth } from '../../../lib/auth.js';
import { createServerClient } from '../../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const { data } = await db.from('tax_brackets').select('bracket_set').order('bracket_set');
  const sets = [...new Set((data || []).map(r => r.bracket_set))];
  res.json(sets);
}
