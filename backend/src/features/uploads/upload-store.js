import { randomUUID } from 'node:crypto';

/**
 * In-memory store for the mock (no-Cloudinary) upload mode. Holds the raw bytes so the mock
 * URL actually resolves to the file — images and PDFs then render in the citizen/admin UIs
 * exactly as they would with Cloudinary in production. Bounded LRU-ish eviction keeps memory
 * flat. Production (Cloudinary configured) never touches this.
 */
const MAX_ENTRIES = 500;
const store = new Map(); // key -> { buffer, contentType, filename }

export function putFile({ buffer, contentType, filename }) {
  const key = randomUUID();
  store.set(key, { buffer, contentType, filename });
  // Evict oldest entries when over capacity (Map preserves insertion order).
  while (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    store.delete(oldest);
  }
  return key;
}

export function getFile(key) {
  return store.get(key) || null;
}

export function clearStore() {
  store.clear();
}
