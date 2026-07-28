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

const CHECKS = {
  'image/jpeg': (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  'image/jpg': (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  'image/png': (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  // WEBP: "RIFF" .... "WEBP"
  'image/webp': (b) =>
    startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8),
  // PDF: "%PDF-"
  'application/pdf': (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46, 0x2d]),
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
