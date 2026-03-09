import { Router } from 'express';
import { getDb } from '../../db.js';
import { authMiddleware } from '../../middleware/auth.js';
import { logChange, diffFields } from '../../middleware/audit.js';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM us_cities ORDER BY city_name').all());
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM us_cities WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const fields = ['city_name', 'state_code', 'housing', 'school', 'healthcare', 'groceries', 'transport', 'lifestyle', 'source', 'source_url'];
  const changes = diffFields(existing, req.body, fields);
  if (!changes) return res.json(existing);

  const updates = Object.keys(changes).map(f => `${f} = @${f}`).join(', ');
  const values = { id: existing.id };
  for (const [f, { new: v }] of Object.entries(changes)) values[f] = v;

  db.prepare(`UPDATE us_cities SET ${updates}, last_updated = datetime('now'), updated_by = ${req.user.userId} WHERE id = @id`).run(values);
  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'us_cities', recordId: existing.id, recordLabel: `${existing.city_name}, ${existing.state_code}`, action: 'update', changes });
  res.json(db.prepare('SELECT * FROM us_cities WHERE id = ?').get(existing.id));
});

// Create
router.post('/', (req, res) => {
  const db = getDb();
  const { city_name, state_code } = req.body;
  if (!city_name || !state_code) return res.status(400).json({ error: 'City name and state code are required' });

  const existing = db.prepare('SELECT id FROM us_cities WHERE city_name = ?').get(city_name);
  if (existing) return res.status(409).json({ error: 'City already exists' });

  const result = db.prepare(
    'INSERT INTO us_cities (city_name, state_code, housing, school, healthcare, groceries, transport, lifestyle, updated_by) VALUES (?, ?, 0, 0, 0, 0, 0, 0, ?)'
  ).run(city_name, state_code, req.user.userId);

  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'us_cities', recordId: result.lastInsertRowid, recordLabel: `${city_name}, ${state_code}`, action: 'create' });
  res.json(db.prepare('SELECT * FROM us_cities WHERE id = ?').get(result.lastInsertRowid));
});

// Delete
router.delete('/:id', (req, res) => {
  const db = getDb();
  const city = db.prepare('SELECT * FROM us_cities WHERE id = ?').get(req.params.id);
  if (!city) return res.status(404).json({ error: 'Not found' });

  db.prepare('DELETE FROM us_cities WHERE id = ?').run(req.params.id);
  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'us_cities', recordId: city.id, recordLabel: `${city.city_name}, ${city.state_code}`, action: 'delete' });
  res.json({ success: true });
});

export default router;
