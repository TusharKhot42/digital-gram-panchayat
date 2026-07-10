import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { env } from '../../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../../src/config/db.js';

// Exercises the real connect/disconnect helpers against an in-memory MongoDB.
describe('database connection lifecycle', () => {
  let mongo;
  let originalUri;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    originalUri = env.MONGODB_URI;
    env.MONGODB_URI = mongo.getUri();
  });

  afterAll(async () => {
    env.MONGODB_URI = originalUri;
    await mongo.stop();
  });

  test('connects then disconnects', async () => {
    await connectDatabase();
    expect(mongoose.connection.readyState).toBe(1);
    await disconnectDatabase();
    expect(mongoose.connection.readyState).toBe(0);
  });
});
