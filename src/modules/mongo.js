import dotenv from 'dotenv';
import { logger } from './globals.js';

const connectToDB = () => {
  // Load in environment variables from file.
  dotenv.config();

  // Log the values.
  logger.info(`MongoDB_URI = ${process.env.MONGO_URI}`);
};

export default connectToDB;
