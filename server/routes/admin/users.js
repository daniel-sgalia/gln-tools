import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../../db.js';
import { authMiddleware, adminOnly } from '../../middleware/auth.js';

const router = Router();
router.use(authMiddleware);
router.use(adminOnly);

router.get('/', (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, email, display_name, role, created_at, last_login FROM users').all();
  res.json(users);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { email, password, displayName, role = 'editor' } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Email, password, and display name required' });
  }

  const hash = bcrypt.hashSync(password, 12);
  try {
    const result = db.prepare('INSERT INTO users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)').run(email, hash, displayName, role);
    res.json({ id: result.lastInsertRowid, email, displayName, role });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email already exists' });
    throw err;
  }
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const { displayName, role, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (displayName) db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(displayName, user.id);
  if (role) db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, user.id);
  if (password) db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(password, 12), user.id);

  const updated = db.prepare('SELECT id, email, display_name, role, created_at, last_login FROM users WHERE id = ?').get(user.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  if (parseInt(req.params.id) === req.user.userId) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
