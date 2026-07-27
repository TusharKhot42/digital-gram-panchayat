import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

mongoose.set('strictQuery', true);

export async function connectDatabase() {
  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', error);
  });

  await mongoose.connect(env.MONGODB_URI, {
    // Bounded connection pool so a burst of concurrent requests reuses sockets instead of
    // opening unbounded connections; horizontal scaling adds instances, not pool size.
    maxPoolSize: env.DB_MAX_POOL_SIZE,
    minPoolSize: env.DB_MIN_POOL_SIZE,
    // Fail fast if the primary is unreachable rather than hanging the request.
    serverSelectionTimeoutMS: env.DB_SERVER_SELECTION_TIMEOUT_MS,
    socketTimeoutMS: env.DB_SOCKET_TIMEOUT_MS,
    // Don't auto-build indexes against large production collections on every boot.
    autoIndex: env.DB_AUTO_INDEX,
  });
  logger.info('MongoDB connected', {
    maxPoolSize: env.DB_MAX_POOL_SIZE,
    autoIndex: env.DB_AUTO_INDEX,
  });
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
