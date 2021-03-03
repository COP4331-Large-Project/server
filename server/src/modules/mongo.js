import dotenv from 'dotenv';
import { logger } from './globals.js';

const connectToDB = () => {
  // Load in environment variables from file.
  dotenv.config();

  // Log the values.
  logger.info(`Host = ${process.env.HOST}`);
  logger.info(`User = ${process.env.USER}`);
  logger.info(`Password = ${process.env.PASSWORD}`);
  logger.info(`Port = ${process.env.PORT}`);
};

export default connectToDB;
