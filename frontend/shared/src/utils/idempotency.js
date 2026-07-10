/**
 * Generates a globally-unique Idempotency-Key for a mutating request. When a citizen
 * submits a complaint offline the key is minted once and reused on every replay, so the
 * backend idempotency middleware returns the original result instead of creating a
 * duplicate. Prefers crypto.randomUUID; falls back to a time+random token on old runtimes.
 */
export function generateIdempotencyKey(prefix = 'idem') {
  const uuid =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}-${uuid}`;
}

// Header name the backend middleware reads. Single source for client + server.
export const IDEMPOTENCY_HEADER = 'Idempotency-Key';
