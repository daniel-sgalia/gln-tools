import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import adminCityRoutes from './routes/admin/cities.js';
import adminTaxRoutes from './routes/admin/taxData.js';
import adminUsCityRoutes from './routes/admin/usCities.js';
import adminAuditRoutes from './routes/admin/audit.js';
import adminUserRoutes from './routes/admin/users.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Initialize database
initDb();
console.log('Database initialized');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/admin/cities', adminCityRoutes);
app.use('/api/admin/tax', adminTaxRoutes);
app.use('/api/admin/us-cities', adminUsCityRoutes);
app.use('/api/admin/audit', adminAuditRoutes);
app.use('/api/admin/users', adminUserRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`GLN API server running on http://localhost:${PORT}`);
});
