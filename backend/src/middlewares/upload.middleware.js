import multer from 'multer';
import { MAX_UPLOAD_SIZE_BYTES, MAX_COMPLAINT_PHOTOS } from '@dgp/shared';
import { AppError } from '../utils/app-error.js';

// Files held in memory, streamed to Cloudinary — never written to local disk.
const storage = multer.memoryStorage();

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new AppError(400, 'INVALID_FILE_TYPE', 'Only JPG, PNG, or WEBP images are allowed'));
  },
});

/**
 * Accept up to MAX_COMPLAINT_PHOTOS images under the `images` field, translating multer's
 * own errors into our uniform AppError envelope.
 */
export function uploadComplaintImages(req, res, next) {
  const handler = upload.array('images', MAX_COMPLAINT_PHOTOS);
  handler(req, res, (err) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof AppError) {
      next(err);
      return;
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(new AppError(400, 'FILE_TOO_LARGE', 'Each image must be 5MB or smaller'));
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      next(
        new AppError(
          400,
          'TOO_MANY_FILES',
          `You can upload at most ${MAX_COMPLAINT_PHOTOS} images`,
        ),
      );
      return;
    }
    next(new AppError(400, 'UPLOAD_ERROR', 'Image upload failed'));
  });
}

const ALLOWED_ATTACHMENT_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const attachmentUpload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (ALLOWED_ATTACHMENT_MIME.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new AppError(400, 'INVALID_FILE_TYPE', 'Attachment must be a PDF or image'));
  },
});

/**
 * Accept a single optional notice attachment (PDF or image, <=5MB) under `attachment`.
 */
export function uploadNoticeAttachment(req, res, next) {
  const handler = attachmentUpload.single('attachment');
  handler(req, res, (err) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof AppError) {
      next(err);
      return;
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(new AppError(400, 'FILE_TOO_LARGE', 'The attachment must be 5MB or smaller'));
      return;
    }
    next(new AppError(400, 'UPLOAD_ERROR', 'Attachment upload failed'));
  });
}

/**
 * Accept up to 5 certificate supporting documents (PDF/image, <=5MB each) under `documents`.
 */
export function uploadCertificateDocuments(req, res, next) {
  const handler = attachmentUpload.array('documents', 5);
  handler(req, res, (err) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof AppError) {
      next(err);
      return;
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(new AppError(400, 'FILE_TOO_LARGE', 'Each document must be 5MB or smaller'));
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      next(new AppError(400, 'TOO_MANY_FILES', 'You can upload at most 5 documents'));
      return;
    }
    next(new AppError(400, 'UPLOAD_ERROR', 'Document upload failed'));
  });
}

/**
 * Accept up to 5 tax-bill scans (PDF/image, <=5MB each) under `bills`. Reuses the shared
 * attachment upload — no duplicate upload logic. No-ops on JSON requests (backward compatible).
 */
export function uploadTaxBills(req, res, next) {
  const handler = attachmentUpload.array('bills', 5);
  handler(req, res, (err) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof AppError) {
      next(err);
      return;
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(new AppError(400, 'FILE_TOO_LARGE', 'Each bill must be 5MB or smaller'));
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      next(new AppError(400, 'TOO_MANY_FILES', 'You can upload at most 5 bills'));
      return;
    }
    next(new AppError(400, 'UPLOAD_ERROR', 'Bill upload failed'));
  });
}

/**
 * Accept a single optional image (<=5MB) under `image` — reuses the image-only filter.
 */
export function uploadSingleImage(req, res, next) {
  const handler = upload.single('image');
  handler(req, res, (err) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof AppError) {
      next(err);
      return;
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(new AppError(400, 'FILE_TOO_LARGE', 'The image must be 5MB or smaller'));
      return;
    }
    next(new AppError(400, 'UPLOAD_ERROR', 'Image upload failed'));
  });
}
