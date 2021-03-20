import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from '../globals';

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
    throw new Error('Connection unsuccessful: the URI was not provided');
  }

  try {
    // Create the DB connection.
    await mongoose.connect(process.env.MONGO_URI, connectionOptions);
  } catch (error) {
    throw new Error(error);
  }

  const jsonOptions = {
    versionKey: false,
    useProjection: true,
  };

  // Set options
  mongoose.set('toJSON', jsonOptions);

  // Log the values.
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`MongoDB_URI = ${process.env.MONGO_URI}`);
  }
};

const disconnectFromDB = async () => {
  // Close the DB connection.
  await mongoose.connection.close();
};

export { connectToDB, disconnectFromDB };
