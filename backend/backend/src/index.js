require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const setupSocket = require('./socket');

const authRoutes         = require('./routes/authRoutes');
const serviceRoutes      = require('./routes/serviceRoutes');
const requestRoutes      = require('./routes/requestRoutes');
const userRoutes         = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reviewRoutes       = require('./routes/reviewRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const chatRoutes         = require('./routes/chatRoutes');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 5000;

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:4173',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth',          authRoutes);
app.use('/api/services',      serviceRoutes);
app.use('/api/requests',      requestRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/chat',          chatRoutes);

// Socket.io
const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true }
});
setupSocket(io);

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

server.listen(PORT, () => {
  console.log(`🚀 RelConnect API + Socket.io sur http://localhost:${PORT}`);
});

module.exports = app;
