/**
 * Build / reconcile all MongoDB indexes to match the current schemas.
 *
 *   npm run db:indexes
 *
 * Use this in production when DB_AUTO_INDEX=false (recommended for large collections): deploy
 * the new code, then run this once in a maintenance window so index builds are intentional and
 * observable rather than happening implicitly on every boot. Safe to re-run — syncIndexes is
 * idempotent (creates missing indexes, drops ones no longer declared).
 */
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { createApp } from '../src/app.js'; // side effect: imports every feature → registers all models
import { logger } from '../src/utils/logger.js';

async function run() {
  createApp(); // ensure every model module is imported and registered
  await connectDatabase();

  const models = Object.entries(mongoose.models);
  for (const [name, model] of models) {
    const start = Date.now();
    await model.syncIndexes();
    logger.info(`Indexes synced: ${name} (${Date.now() - start}ms)`);
  }

  logger.info(`Done — ${models.length} collections reconciled.`);
  await disconnectDatabase();
}

run().catch(async (err) => {
  logger.error('Index sync failed', err);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
