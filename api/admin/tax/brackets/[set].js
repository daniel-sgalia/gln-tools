import { requireAuth } from '../../../../lib/auth.js';
import { createServerClient } from '../../../../lib/supabase.js';
import { logChange } from '../../../../lib/audit.js';

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = createServerClient();
  const bracketSet = req.query.set;

  if (req.method === 'GET') {
    const { data } = await db.from('tax_brackets').select('*').eq('bracket_set', bracketSet).order('sort_order');
    return res.json(data);
  }

  if (req.method === 'PUT') {
    const { brackets, source } = req.body;

    await db.from('tax_brackets').delete().eq('bracket_set', bracketSet);
    if (brackets.length) {
      await db.from('tax_brackets').insert(brackets.map((b, i) => ({
        bracket_set: bracketSet, min_income: b.min,
        max_income: b.max === Infinity || b.max === null ? null : b.max,
        rate: b.rate, source: source || null, updated_by: user.appUser.id, sort_order: i,
      })));
    }

    await logChange({ userId: user.appUser.id, userEmail: user.email, tableName: 'tax_brackets', recordId: 0, recordLabel: `${bracketSet} brackets`, action: 'update', changes: { [bracketSet]: { old: 'bulk', new: 'updated' } } });
    const { data } = await db.from('tax_brackets').select('*').eq('bracket_set', bracketSet).order('sort_order');
    return res.json(data);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
