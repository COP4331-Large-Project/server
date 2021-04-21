import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import requestSanitizer from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import { connectToDB } from './mongo';
import router from '../routes';
import ErrorHandler from './ErrorHandler';
import swaggerSpecs from './swagger';

const app = express();

async function initWebServer() {
  const httpServer = createServer(app);
  // const io = new Server(httpServer, {
  //   cors: {
  //     origin: 'http://localhost:3000',
  //     methods: ['GET', 'POST'],
  //   },
  // });

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
