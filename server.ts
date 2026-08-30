import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './server/db';
import authRoutes from './server/routes/authRoutes';
import reportRoutes from './server/routes/reportRoutes';
import adminRoutes from './server/routes/adminRoutes';
import aiRoutes from './server/routes/aiRoutes';
import { errorHandler } from './server/middleware/errorMiddleware';

dotenv.config();

// Initialize in-memory / persisted DB
initDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with ample size for base64 image uploads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'FixMyCity AI Backend',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/ai', aiRoutes);

  // Central Error Handler for API
  app.use('/api', errorHandler);

  // Vite middleware for development vs Static SPA for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏙️ FixMyCity AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
});
