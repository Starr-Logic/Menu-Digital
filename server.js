import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initializeDatabase } from './models/index.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import settingsRouter from './routes/settings.js';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Initialize and synchronize the database
  await initializeDatabase();

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Attach socket.io instance to Express app
  app.set('io', io);

  // Monitor socket connections
  io.on('connection', (socket) => {
    console.log(`Client connected to WebSocket: ${socket.id}`);
    
    socket.on('call_waiter', (data) => {
      io.emit('waiter_called', data);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected from WebSocket: ${socket.id}`);
    });
  });

  const PORT = process.env.PORT || 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // API Routes
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/auth', authRouter);

  // Simple JSON error handler for authentication failures and other errors
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err && (err.status === 401 || err.name === 'UnauthorizedError')) {
      return res.status(401).json({ error: err.message || 'Unauthorized' });
    }
    next(err);
  });

  // Serve static assets in production, or mount Vite middleware in development
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

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Close the process using it or change PORT in .env and try again.`);
      process.exit(1);
    }
    console.error('Server error:', error);
    process.exit(1);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
