import express from 'express';
import cors from 'cors';
import { logger } from './globals.js';
import { connectToDB } from './services/mongo.js';
import router from './routes/index.js';

async function main() {
  const app = express();
  app.use(express.json());
  await connectToDB();

  // Enable cross origin
  app.use(cors());
  app.use('/', router);

  if (process.env.NODE_ENV !== 'production') {
    logger.info('Server is running on http://localhost:5000');
  }

  app.listen(process.env.PORT || 5000);
}
main();
