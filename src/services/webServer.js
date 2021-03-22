import express from 'express';
import cors from 'cors';
import requestSanitizer from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import { connectToDB } from './mongo';
import router from '../routes';
import ErrorHandler from './ErrorHandler';
import swaggerSpecs from './swagger';

async function initWebServer() {
  const app = express();

  // Connect to the database
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

  return app;
}

export default initWebServer;
