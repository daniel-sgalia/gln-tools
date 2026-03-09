import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { generateToken } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gln-tools-dev-secret-change-in-production';
const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

  const token = generateToken(user);
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ id: user.id, email: user.email, displayName: user.display_name, role: user.role });
});

router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ id: decoded.userId, email: decoded.email, displayName: decoded.displayName, role: decoded.role });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
