import { createServer } from 'http';
import app from './app';
import { initializeSocket } from './socket/socket.io';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

