import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        'https://castncart.netlify.app',
        'http://localhost:5173',
        'http://localhost:5000',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'supersecretskillspherekey_2026');
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    const userRoom = `user:${userId}`;

    socket.join(userRoom);
    console.log(`🔌 User connected to socket: ${socket.user.name} (${socket.user.role}) [Joined ${userRoom}]`);

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected from socket: ${socket.user.name}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper function to emit events safely to a specific user room
export const emitToUser = (userId, event, payload) => {
  if (io && userId) {
    const room = `user:${userId.toString()}`;
    io.to(room).emit(event, payload);
    console.log(`📡 Emitted '${event}' to room ${room}`);
  }
};
