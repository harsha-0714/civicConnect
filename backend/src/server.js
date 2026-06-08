// ─────────────────────────────────────────────────────────────
// FILE: backend/src/server.js
// PRODUCTION-READY — Includes:
//   ✅ Keep-alive ping (prevents Render free-tier cold starts)
//   ✅ Production CORS (locked to FRONTEND_URL only)
//   ✅ MongoDB connection pool limit (maxPoolSize=5 for Atlas free)
//   ✅ Graceful shutdown handler
//   ✅ Old resolved issue cleanup cron (saves Atlas 512MB storage)
// ─────────────────────────────────────────────────────────────

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

const authRoutes      = require('./routes/auth.routes');
const issueRoutes     = require('./routes/issue.routes');
const voteRoutes      = require('./routes/vote.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// ─────────────────────────────────────────────
// SECURITY MIDDLEWARE
// ─────────────────────────────────────────────
app.use(helmet());

// ✅ FIX: Lock CORS to your Vercel URL in production
//         Allow localhost only in development
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─────────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// ─────────────────────────────────────────────
// BODY PARSING
// ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Use 'dev' logs locally, 'combined' in production
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─────────────────────────────────────────────
// HEALTH CHECK — used by UptimeRobot keep-alive
// ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CivicConnect API',
    env: process.env.NODE_ENV,
    uptime: Math.floor(process.uptime()) + 's'
  });
});

// ─────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────
app.use('/api/v1/auth',      authRoutes);
app.use('/api/v1/issues',    issueRoutes);
app.use('/api/v1/votes',     voteRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// ─────────────────────────────────────────────
// KEEP-ALIVE (prevents Render free-tier spin-down)
// ✅ FIX: Pings /health every 14 minutes
//         Only runs in production on Render
// ─────────────────────────────────────────────
function startKeepAlive() {
  const serviceUrl = process.env.RENDER_EXTERNAL_URL;
  if (!serviceUrl) {
    console.log('ℹ️  Keep-alive skipped (not on Render)');
    return;
  }

  setInterval(async () => {
    try {
      await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
      console.log(`✅ Keep-alive ping sent to ${serviceUrl}/health`);
    } catch (err) {
      console.warn(`⚠️  Keep-alive ping failed: ${err.message}`);
    }
  }, 14 * 60 * 1000); // every 14 minutes

  console.log('🔄 Keep-alive scheduler started');
}

// ─────────────────────────────────────────────
// CLEANUP CRON — saves MongoDB Atlas free 512MB
// ✅ FIX: Deletes resolved issues older than 90 days
//         Runs every day at midnight
// ─────────────────────────────────────────────
function startCleanupCron() {
  cron.schedule('0 0 * * *', async () => {
    try {
      const Issue = require('./models/Issue.model');
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const result = await Issue.deleteMany({
        status: 'resolved',
        resolved_at: { $lt: cutoff }
      });
      console.log(`🧹 Cleanup: removed ${result.deletedCount} old resolved issues`);
    } catch (err) {
      console.error('❌ Cleanup cron error:', err.message);
    }
  });
  console.log('🧹 Cleanup cron scheduled (daily midnight)');
}

// ─────────────────────────────────────────────
// DATABASE CONNECTION + SERVER START
// ✅ FIX: maxPoolSize=5 prevents Atlas free-tier
//         from hitting 500 connection limit
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 5,          // ✅ Atlas free tier limit
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB Atlas connected');

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });

  // Start production-only services
  startKeepAlive();
  startCleanupCron();

  // ✅ FIX: Graceful shutdown — closes DB connections cleanly
  //         Prevents Render from leaving dangling connections
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });
  });
})
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

module.exports = app;