import { logger } from './globals';
import initWebServer from './services/webServer';
import io from './services/Socket';

(async function main() {
  // Load in environment variables from file.
  dotenv.config();
  const app = await initWebServer();

  // Log host
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Server is running on http://localhost:5000');
  }

  // Initialize Socket.io
  const httpServer = http.createServer(app);
  io.attach(httpServer);
  httpServer.listen(3000);

  // Start listening for webserver connections.
  app.listen(process.env.PORT || 5000);
}());
