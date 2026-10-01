import { AppError } from './app-error.js';

/**
 * Content-based file-type validation. The multer `fileFilter` only sees the client-supplied
 * `mimetype`, which is trivially spoofable — a caller can label any bytes `image/png`. Here we
 * inspect the actual leading bytes (magic number) so a file's real type must match what it
 * claims. Defence in depth on top of `X-Content-Type-Options: nosniff` and Cloudinary's own
 * re-encoding of images.
 */

/** Does `buffer` start with the given byte signature at `offset`? */
function startsWith(buffer, bytes, offset = 0) {
  if (buffer.length < offset + bytes.length) return false;
  return bytes.every((b, i) => buffer[offset + i] === b);
}

function containsBytes(buffer, bytes, maxSearch = 4096) {
  if (!buffer || buffer.length < bytes.length) return false;
  const limit = Math.min(buffer.length - bytes.length, maxSearch);
  for (let i = 0; i <= limit; i++) {
    if (bytes.every((b, j) => buffer[i + j] === b)) return true;
  }
  return false;
}

const DANGEROUS = {
  // Script / HTML payload
  html: (b) => {
    if (!b || b.length < 2) return false;
    const str = b.subarray(0, Math.min(b.length, 256)).toString('ascii').toLowerCase().trimStart();
    return (
      str.startsWith('<html') ||
      str.startsWith('<!doctype') ||
      str.startsWith('<script') ||
      str.startsWith('<?xml') ||
      str.startsWith('<svg') ||
      str.startsWith('<?php')
    );
  },
  // Executable binary files
  executable: (b) => startsWith(b, [0x4d, 0x5a]) || startsWith(b, [0x7f, 0x45, 0x4c, 0x46]),
  // Conflicting genuine formats
  png: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  jpeg: (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  webp: (b) =>
    startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8),
  pdf: (b) => containsBytes(b, [0x25, 0x50, 0x44, 0x46]),
};

const CHECKS = {
  'image/jpeg': (b) => {
    if (!b || b.length < 3) return false;
    if (DANGEROUS.html(b) || DANGEROUS.executable(b)) return false;
    if (DANGEROUS.pdf(b) || DANGEROUS.png(b)) return false;
    return startsWith(b, [0xff, 0xd8, 0xff]);
  },
  'image/jpg': (b) => {
    if (!b || b.length < 3) return false;
    if (DANGEROUS.html(b) || DANGEROUS.executable(b)) return false;
    if (DANGEROUS.pdf(b) || DANGEROUS.png(b)) return false;
    return startsWith(b, [0xff, 0xd8, 0xff]);
  },
  'image/png': (b) => {
    if (!b || b.length < 8) return false;
    if (DANGEROUS.html(b) || DANGEROUS.executable(b)) return false;
    if (DANGEROUS.pdf(b) || DANGEROUS.jpeg(b)) return false;
    return startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  },
  'image/webp': (b) => {
    if (!b || b.length < 12) return false;
    if (DANGEROUS.html(b) || DANGEROUS.executable(b)) return false;
    if (DANGEROUS.pdf(b)) return false;
    return startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8);
  },
  'application/pdf': (b) => {
    if (!b) return false;
    // Reject HTML/executable spoofing
    if (DANGEROUS.html(b) || DANGEROUS.executable(b)) return false;
    // Reject image disguised as PDF
    if (DANGEROUS.png(b) || DANGEROUS.jpeg(b) || DANGEROUS.webp(b)) return false;
    return true;
  },
  'application/x-pdf': (b) => {
    if (!b) return false;
    if (DANGEROUS.html(b) || DANGEROUS.executable(b)) return false;
    if (DANGEROUS.png(b) || DANGEROUS.jpeg(b) || DANGEROUS.webp(b)) return false;
    return true;
  },
};

/** True when the buffer's real signature matches the declared mimetype. */
export function signatureMatches(buffer, mimetype) {
  const check = CHECKS[mimetype];
  return typeof check === 'function' ? check(buffer) : false;
}

/**
 * Collect every uploaded file off the request regardless of how multer stored it
 * (`.single` → req.file, `.array` → req.files[], `.fields` → req.files{ field: [] }).
 */
function collectFiles(req) {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === 'object') return Object.values(req.files).flat();
  return [];
}

/**
 * Express middleware: after multer has parsed the upload, reject any file whose real bytes
 * don't match its declared type. Placed immediately after each multer handler.
 */
export function verifyUploadedFiles(req, _res, next) {
  for (const file of collectFiles(req)) {
    if (!file?.buffer || !signatureMatches(file.buffer, file.mimetype)) {
      next(
        new AppError(
          400,
          'INVALID_FILE_TYPE',
          'A file failed content validation — it does not match its declared type.',
        ),
      );
      return;
    }
  }
  next();
}
