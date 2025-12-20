import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import supportRoutes from './routes/support.js';
import consultantRoutes from './routes/consultants.js';
import authRoutes from './routes/auth.js';
import analyticsRoutes from './routes/analytics.js';
import dailyService from './services/daily.js';
import websocketService from './services/websocket.js';
import db from './db/index.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Allow display-capture for screen sharing in embedded iframes
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'display-capture=(self "https://*.daily.co")');
  next();
});

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/support', supportRoutes);
app.use('/api/consultants', consultantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', async (_req, res) => {
  const dailyOk = await dailyService.healthCheck();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    seeded: db.isSeeded(),
    services: {
      daily: dailyOk ? 'connected' : 'disconnected',
      websocket: `${websocketService.getConnectedCount()} clients`,
    },
  });
});

// Start server with WebSocket support
const PORT = 3002;
const server = createServer(app);

// Initialize WebSocket
websocketService.initialize(server);

server.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  NICEHR Remote Support Server');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  HTTP:      http://localhost:${PORT}`);
  console.log(`  Daily.co:  ${process.env.DAILY_DOMAIN || 'not configured'}`);
  console.log(`  Database:  ${db.isSeeded() ? 'seeded' : 'empty (run npm run db:seed)'}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('');
});
