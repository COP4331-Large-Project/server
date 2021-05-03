import dotenv from 'dotenv';
import { logger } from './globals';
import initWebServer from './services/webServer';

(async function main() {
  // Load in environment variables from file.
  dotenv.config();
  const httpServer = await initWebServer();

  // Log host
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Server is running on http://localhost:5000');
  }

  // Start listening for webserver connections.
  httpServer.listen(process.env.PORT || 5000);
}());
