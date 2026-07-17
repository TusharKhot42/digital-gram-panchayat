import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Disk-backed store for the mock (no-Cloudinary) upload mode.
 *
 * This used to be an in-memory Map, which meant every backend restart silently deleted the
 * bytes of every previously uploaded file while the URLs stayed in the database — in dev,
 * nodemon restarts on each source save, so complaint photos and notice attachments broke
 * within minutes of being uploaded. Bytes now live in backend/uploads/ (one file per key,
 * plus a .json sidecar for content type and original name) and survive restarts.
 * Production (Cloudinary configured) never touches this.
 */
const UPLOAD_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../uploads');

// Keys are UUIDs we generate; reject anything else so a crafted key can't walk the fs.
const KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function ensureDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function putFile({ buffer, contentType, filename }) {
  ensureDir();
  const key = randomUUID();
  fs.writeFileSync(path.join(UPLOAD_DIR, key), buffer);
  fs.writeFileSync(path.join(UPLOAD_DIR, `${key}.json`), JSON.stringify({ contentType, filename }));
  return key;
}

export function getFile(key) {
  if (!KEY_PATTERN.test(key)) return null;
  const filePath = path.join(UPLOAD_DIR, key);
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  let meta = {};
  try {
    meta = JSON.parse(fs.readFileSync(path.join(UPLOAD_DIR, `${key}.json`), 'utf8'));
  } catch {
    // Sidecar missing or unreadable — serve the bytes with a generic content type.
  }
  return { buffer, contentType: meta.contentType, filename: meta.filename };
}

/** Delete a stored file (and its sidecar) by key. Safe to call with an unknown key. */
export function removeFile(key) {
  if (!KEY_PATTERN.test(key || '')) return;
  fs.rmSync(path.join(UPLOAD_DIR, key), { force: true });
  fs.rmSync(path.join(UPLOAD_DIR, `${key}.json`), { force: true });
}

export function clearStore() {
  if (!fs.existsSync(UPLOAD_DIR)) return;
  for (const entry of fs.readdirSync(UPLOAD_DIR)) {
    if (KEY_PATTERN.test(entry.replace(/\.json$/, ''))) {
      fs.rmSync(path.join(UPLOAD_DIR, entry), { force: true });
    }
  }
}
