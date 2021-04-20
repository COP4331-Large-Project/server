import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { logger } from './globals';
import { emitter } from './controllers/group';
import initWebServer from './services/webServer';
// import Socket from './services/Socket';

(async function main() {
  // Load in environment variables from file.
  dotenv.config();
  const app = await initWebServer();

  // Log host
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Server is running on http://localhost:5000');
  }

  // Start listening for webserver connections.
  httpServer.listen(process.env.PORT || 5000);

  io.on('connection', (socket) => {
    console.log('New client connected');
    socket.emit('joined');
    socket.on('ping', () => {
      console.log('pong');
    });
    socket.emit('joined group');
  });
}());
