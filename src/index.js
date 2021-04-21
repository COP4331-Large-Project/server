import dotenv from 'dotenv';
import Socket from './services/Socket';
import { logger } from './globals';
import initWebServer from './services/webServer';
// import io from './services/Socket';

// eslint-disable-next-line import/no-mutable-exports
let io;

(async function main() {
  // Load in environment variables from file.
  dotenv.config();
  const httpServer = await initWebServer();
  io = Socket(httpServer);

  // Log host
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Server is running on http://localhost:5000');
  }

  // Start listening for webserver connections.
  httpServer.listen(process.env.PORT || 5000);
}());

export default io;
