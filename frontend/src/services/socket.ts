import { io, Socket } from 'socket.io-client';
import { BH1750Reading, INMP441Reading } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onBH1750Update(callback: (reading: BH1750Reading) => void) {
    if (this.socket) {
      this.socket.on('bh1750:new', callback);
    }
  }

  onINMP441Update(callback: (reading: INMP441Reading) => void) {
    if (this.socket) {
      this.socket.on('inmp441:new', callback);
    }
  }

  offBH1750Update(callback?: (reading: BH1750Reading) => void) {
    if (this.socket) {
      this.socket.off('bh1750:new', callback);
    }
  }

  offINMP441Update(callback?: (reading: INMP441Reading) => void) {
    if (this.socket) {
      this.socket.off('inmp441:new', callback);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();

