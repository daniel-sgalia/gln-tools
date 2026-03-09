import { Router } from 'express';
import { getDb } from '../../db.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const db = getDb();
  const { table, user_id, limit = 100, offset = 0 } = req.query;

  let where = '1=1';
  const params = [];
  if (table) { where += ' AND table_name = ?'; params.push(table); }
  if (user_id) { where += ' AND user_id = ?'; params.push(user_id); }

  const rows = db.prepare(`SELECT * FROM audit_log WHERE ${where} ORDER BY timestamp DESC LIMIT ? OFFSET ?`)
    .all(...params, parseInt(limit), parseInt(offset));
  const total = db.prepare(`SELECT COUNT(*) as count FROM audit_log WHERE ${where}`).get(...params);

  res.json({ rows, total: total.count });
});

export default router;
