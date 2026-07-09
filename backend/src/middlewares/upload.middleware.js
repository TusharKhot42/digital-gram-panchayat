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
