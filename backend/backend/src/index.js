require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes         = require('./routes/authRoutes');
const serviceRoutes      = require('./routes/serviceRoutes');
const requestRoutes      = require('./routes/requestRoutes');
const userRoutes         = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reviewRoutes       = require('./routes/reviewRoutes');
const adminRoutes        = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://localhost:4173',
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

app.use('/api/auth',          authRoutes);
app.use('/api/services',      serviceRoutes);
app.use('/api/requests',      requestRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/admin',         adminRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`🚀 RelConnect API démarrée sur http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
