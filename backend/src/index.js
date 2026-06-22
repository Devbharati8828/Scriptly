import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Scriptly API is running' });
});

// Auth Routes (public — no JWT required)
app.use('/api/auth', authRoutes);

// API Routes (protected — requireAuth applied per-route in api.js)
app.use('/api', apiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});
