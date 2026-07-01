import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';
import { initializeDatabase } from './models/index.js';

dotenv.config();

async function startServer() {
  await initializeDatabase();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  app.set('io', io);

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
