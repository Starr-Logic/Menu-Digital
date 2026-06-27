import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { initializeDatabase } from './models/index.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Initialize and synchronize the database
  await initializeDatabase();

  const app = express();
  const server = http.createServer(app);
  
  // Enable CORS
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

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
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected from WebSocket: ${socket.id}`);
    });
  });

  const PORT = process.env.PORT || 5000;

  // Middleware for parsing JSON requests
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // API Routes
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);

  // Simple welcome route for the API root
  app.get('/', (req, res) => {
    res.json({ message: "Welcome to BiteQR Backend API", status: "online" });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend Server is running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting backend server:', err);
});
