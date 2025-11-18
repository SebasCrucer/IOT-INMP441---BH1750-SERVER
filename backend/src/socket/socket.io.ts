import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { BH1750Reading, INMP441Reading } from '@prisma/client';

let io: SocketServer | null = null;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitBH1750Reading = (reading: BH1750Reading) => {
  if (io) {
    io.emit('bh1750:new', reading);
  }
};

export const emitINMP441Reading = (reading: INMP441Reading) => {
  if (io) {
    io.emit('inmp441:new', reading);
  }
};

