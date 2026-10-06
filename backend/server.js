import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import workshopRoutes from './routes/workshopRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';

import http from 'http';
import { initSocket } from './utils/socket.js';

const app = express();
const server = http.createServer(app);
initSocket(server);

const allowedOrigins = [
  'https://castncart.netlify.app',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root & Health Check Routes
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'CastNCart Backend API is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Database connection & Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/castncart';

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
