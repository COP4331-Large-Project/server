import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import requestSanitizer from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import { connectToDB } from './mongo';
import Socket from './Socket';
import router from '../routes';
import ErrorHandler from './ErrorHandler';
import swaggerSpecs from './swagger';
import { Server } from 'http';

const app = express();

async function initWebServer(): Promise<Server> {
  const httpServer: Server = createServer(app);
  Socket(httpServer);

  await connectToDB();

  // Enable cross origin
  app.use(
    cors(),
    express.json(),
    requestSanitizer(),
    router,
    ErrorHandler,
  );

  // Enable swagger
  app.use(
    '/',
    swaggerUi.serve,
  );

  app.get(
    '/',
    swaggerUi.setup(swaggerSpecs(), { explorer: true }),
  );

  return httpServer;
}

export default initWebServer;

export { app };
