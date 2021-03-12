import express from 'express';
import { logger } from './globals.js';
import { connectToDB } from './services/mongo.js';
import users from './routes/user.js';

async function main() {
  const app = express();
  app.use(express.json());
  await connectToDB();

  app.use('/users', users);

  if (process.env.NODE_ENV !== 'production') {
    logger.info('Server is running on http://localhost:5000');
  }

  app.listen(process.env.PORT || 5000);
}
main();
