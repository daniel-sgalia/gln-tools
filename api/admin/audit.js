import { requireAuth } from '../../lib/auth.js';
import { createServerClient } from '../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();

  const { table, user_id, limit = 100, offset = 0 } = req.query;

  let query = db.from('audit_log').select('*', { count: 'exact' });
  if (table) query = query.eq('table_name', table);
  if (user_id) query = query.eq('user_id', user_id);
  query = query.order('timestamp', { ascending: false }).range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

  const { data: rows, count } = await query;
  res.json({ rows, total: count });
}
