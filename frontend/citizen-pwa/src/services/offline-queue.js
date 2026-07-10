import { OFFLINE_DB } from '@dgp/shared';

/**
 * Minimal promise-wrapped IndexedDB access for the offline complaint queue. Kept dependency-
 * free (no `idb`) to hold the bundle down. Each queued complaint carries its own
 * Idempotency-Key, so replaying the queue after reconnect can never create a duplicate.
 */

const STORE = OFFLINE_DB.stores.complaintQueue;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(OFFLINE_DB.name, OFFLINE_DB.version);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db, mode, fn) {
  return new Promise((resolve, reject) => {
    const store = db.transaction(STORE, mode).objectStore(STORE);
    const request = fn(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Persist one complaint submission for later delivery. `record.id` must be unique. */
export async function enqueueComplaint(record) {
  const db = await openDb();
  try {
    await tx(db, 'readwrite', (store) => store.put(record));
  } finally {
    db.close();
  }
  return record;
}

/** All queued complaints, oldest first. */
export async function getQueuedComplaints() {
  const db = await openDb();
  try {
    const all = await tx(db, 'readonly', (store) => store.getAll());
    return all.sort((a, b) => a.createdAt - b.createdAt);
  } finally {
    db.close();
  }
}

/** Remove a queued complaint once it has been delivered. */
export async function removeQueued(id) {
  const db = await openDb();
  try {
    await tx(db, 'readwrite', (store) => store.delete(id));
  } finally {
    db.close();
  }
}

/** Number of complaints still waiting to be sent. */
export async function countQueued() {
  const db = await openDb();
  try {
    return await tx(db, 'readonly', (store) => store.count());
  } finally {
    db.close();
  }
}
