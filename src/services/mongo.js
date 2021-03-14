import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from '../globals.js';

const connectToDB = () => {
  // Load in environment variables from file.
  dotenv.config();

  // Connection options
  const connectionOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  };

  // Create the DB connection.
  mongoose.connect(process.env.MONGO_URI, connectionOptions);

  // Log the values.
  logger.info(`MongoDB_URI = ${process.env.MONGO_URI}`);
};

const disconnectFromDB = () => {
  // Close the DB connection.
  mongoose.connection().close();
};

export { connectToDB, disconnectFromDB };
