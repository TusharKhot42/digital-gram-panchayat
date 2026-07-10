import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Stores the response for a given Idempotency-Key so a retried request (e.g. an offline
 * complaint replayed on reconnect) returns the original result instead of creating a
 * duplicate. Auto-expires after 24h via a TTL index.
 */
const idempotencyKeySchema = new Schema({
  key: { type: String, required: true, unique: true },
  method: { type: String },
  path: { type: String },
  statusCode: { type: Number },
  response: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 }, // TTL 24h
});

export const IdempotencyKey = model('IdempotencyKey', idempotencyKeySchema);
