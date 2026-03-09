import { Router } from 'express';
import { getDb } from '../../db.js';
import { authMiddleware } from '../../middleware/auth.js';
import { logChange, diffFields } from '../../middleware/audit.js';

const router = Router();
router.use(authMiddleware);

// State tax rates
router.get('/state-rates', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM state_tax_rates ORDER BY state_code').all());
});

router.put('/state-rates/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM state_tax_rates WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const fields = ['state_code', 'state_name', 'rate', 'local_rate', 'source', 'source_url'];
  const changes = diffFields(existing, req.body, fields);
  if (!changes) return res.json(existing);

  const updates = Object.keys(changes).map(f => `${f} = @${f}`).join(', ');
  const values = { id: existing.id };
  for (const [f, { new: v }] of Object.entries(changes)) values[f] = v;

  db.prepare(`UPDATE state_tax_rates SET ${updates}, last_updated = datetime('now'), updated_by = ${req.user.userId} WHERE id = @id`).run(values);
  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'state_tax_rates', recordId: existing.id, recordLabel: `${existing.state_name} (${existing.state_code})`, action: 'update', changes });
  res.json(db.prepare('SELECT * FROM state_tax_rates WHERE id = ?').get(existing.id));
});

// List all bracket sets
router.get('/bracket-sets', (req, res) => {
  const db = getDb();
  const sets = db.prepare('SELECT DISTINCT bracket_set FROM tax_brackets ORDER BY bracket_set').all();
  res.json(sets.map(s => s.bracket_set));
});

// Tax brackets
router.get('/brackets/:set', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM tax_brackets WHERE bracket_set = ? ORDER BY sort_order').all(req.params.set));
});

router.put('/brackets/:set', (req, res) => {
  const db = getDb();
  const bracketSet = req.params.set;
  const { brackets, source } = req.body;

  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM tax_brackets WHERE bracket_set = ?').run(bracketSet);
    const insert = db.prepare(
      'INSERT INTO tax_brackets (bracket_set, min_income, max_income, rate, source, updated_by, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    brackets.forEach((b, i) => {
      insert.run(bracketSet, b.min, b.max === Infinity || b.max === null ? null : b.max, b.rate, source || null, req.user.userId, i);
    });
  });
  transaction();

  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'tax_brackets', recordId: 0, recordLabel: `${bracketSet} brackets`, action: 'update', changes: { [bracketSet]: { old: 'bulk', new: 'updated' } } });
  res.json(db.prepare('SELECT * FROM tax_brackets WHERE bracket_set = ? ORDER BY sort_order').all(bracketSet));
});

export default router;
