import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gln-tools-dev-secret-change-in-production';

export function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role, displayName: user.display_name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authMiddleware(req, res, next) {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
