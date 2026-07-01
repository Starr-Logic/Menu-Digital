import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import settingsRouter from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/auth', authRouter);

// Simple JSON error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err && (err.status === 401 || err.name === 'UnauthorizedError')) {
    return res.status(401).json({ error: err.message || 'Unauthorized' });
  }
  next(err);
});

export default app;
