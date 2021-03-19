import express from 'express';
import cors from 'cors';
import requestSanitizer from 'express-mongo-sanitize';
import { connectToDB } from './mongo';
import router from '../routes';
import ErrorHandler from './ErrorHandler';

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

  return app;
}

export default initWebServer;
