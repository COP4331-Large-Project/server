import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from '../globals.js';

const connectToDB = async () => {
  // Load in environment variables from file.
  dotenv.config();

  // Connection options
  const connectionOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  };

  if (typeof process.env.MONGO_URI === 'undefined') {
    logger.fatal('Connection unsuccessful: the URI was not provided');
  }

  try {
  // Create the DB connection.
    await mongoose.connect(process.env.MONGO_URI, connectionOptions);
  } catch (error) {
    logger.fatal(error);
  }

  // Log the values.
  logger.info(`MongoDB_URI = ${process.env.MONGO_URI}`);
};

const disconnectFromDB = () => {
  // Close the DB connection.
  mongoose.connection().close();
};

export { connectToDB, disconnectFromDB };
