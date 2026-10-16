import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, getDatabaseInfo } from './config/db.js';
import { initSocket } from './sockets/socketHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { User } from './models/User.js';
import { seedDatabase } from './utils/seed.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import trafficRoutes from './routes/trafficRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import parkingRoutes from './routes/parkingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import supportRoutes from './routes/supportRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Initialize Socket.IO
initSocket(server, CORS_ORIGIN);

// Global Middleware
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'Urban Mobility Coordination Platform (UMCP)',
    database: getDatabaseInfo(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/traffic', trafficRoutes);
app.use('/api/v1/emergency', emergencyRoutes);
app.use('/api/v1/parking', parkingRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/support', supportRoutes);

// Centralized error handling
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database has no users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty, auto-seeding default demo dataset...');
      await seedDatabase();
    }

    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  UMCP Backend Server running on http://localhost:${PORT}`);
      console.log(`  REST API version: /api/v1`);
      console.log(`  Real-time Socket.IO: initialized`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('[Server] Failed to launch backend server:', err);
    process.exit(1);
  }
};

startServer();

export { app, server };
