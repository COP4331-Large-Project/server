import express from 'express';
import cors from 'cors';
import { logger } from './globals';
import { connectToDB } from './services/mongo';
import router from './routes';
import ErrorHandler from './services/ErrorHandler';

(async function main() {
  const app = express();

  // Connect to the database
  await connectToDB();

  // Enable cross origin
  app.use(
    cors(),
    express.json(),
    router,
    ErrorHandler,
  );

  // Log host
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Server is running on http://localhost:5000');
  }

  // Start listening for webserver connections.
  app.listen(process.env.PORT || 5000);
}());
