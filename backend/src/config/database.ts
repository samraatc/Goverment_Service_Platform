import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/govservices';

/**
 * Cached connection — reused across serverless invocations.
 * Prevents opening a new TCP connection on every Vercel / Lambda request.
 */
let cachedConnection: typeof mongoose | null = null;

const connectDB = async (): Promise<void> => {
  // Already open
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });

    cachedConnection = mongoose;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
      cachedConnection = null;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected.');
      cachedConnection = null;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      cachedConnection = mongoose;
    });
  } catch (error) {
    cachedConnection = null;
    logger.error(`MongoDB connection failed: ${error}`);
    // Throw — let the caller decide whether to crash or return 503
    throw error;
  }
};

export default connectDB;
