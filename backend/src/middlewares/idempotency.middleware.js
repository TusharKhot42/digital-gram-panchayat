import { IdempotencyKey } from '../features/idempotency/idempotency.model.js';
import { logger } from '../utils/logger.js';

/**
 * Idempotency middleware. If the request carries an `Idempotency-Key` header and that key
 * has been seen before, the stored response is replayed (no duplicate side-effect).
 * Otherwise the request proceeds and its successful (2xx) response is captured under the key.
 *
 * No header -> pure pass-through, so every existing endpoint stays backward compatible.
 */
export async function idempotency(req, res, next) {
  const key = req.get('Idempotency-Key');
  if (!key) {
    next();
    return;
  }

  try {
    const existing = await IdempotencyKey.findOne({ key });
    if (existing) {
      res.status(existing.statusCode || 200).json(existing.response);
      return;
    }
  } catch (err) {
    logger.error('Idempotency lookup failed', err);
    next();
    return;
  }

  // Reserve the key immediately so concurrent replays can't both create the resource.
  try {
    await IdempotencyKey.create({ key, method: req.method, path: req.originalUrl });
  } catch {
    // Another request already reserved it — replay its (now stored) response if present.
    const existing = await IdempotencyKey.findOne({ key }).catch(() => null);
    if (existing && existing.statusCode) {
      res.status(existing.statusCode).json(existing.response);
      return;
    }
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      IdempotencyKey.updateOne(
        { key },
        { $set: { statusCode: res.statusCode, response: body } },
      ).catch((err) => logger.error('Idempotency store failed', err));
    } else {
      // Non-success: drop the reservation so the client can retry cleanly.
      IdempotencyKey.deleteOne({ key }).catch(() => {});
    }
    return originalJson(body);
  };

  next();
}
