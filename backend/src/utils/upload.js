import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { putFile, removeFile } from '../features/uploads/upload-store.js';
import { logger } from './logger.js';

/**
 * Recover a Cloudinary public_id from a secure_url so the asset can be destroyed.
 * A URL looks like  https://res.cloudinary.com/<cloud>/<type>/upload/v123/<folder>/<id>.<ext>
 * — the public_id is everything after the version segment, minus the extension.
 * Returns null for anything that isn't a Cloudinary delivery URL.
 */
function cloudinaryPublicId(url) {
  const m = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i.exec(url || '');
  return m ? m[1] : null;
}

/**
 * Delete a previously-uploaded asset when it is being replaced or removed. Best-effort and
 * never throws — a failed cleanup must not fail the user's save. No-op for empty values.
 *
 * - Cloudinary URL  → cloudinary.uploader.destroy(public_id)
 * - local/mock URL  → drop it from the disk-backed upload store
 * - anything else    → ignored
 *
 * @param {string} url  the stored secure URL to release
 */
export async function deleteAsset(url) {
  if (!url) return;
  try {
    if (isCloudinaryConfigured && url.includes('res.cloudinary.com')) {
      const publicId = cloudinaryPublicId(url);
      if (publicId) {
        // resource_type 'auto' isn't valid for destroy; PDFs are stored as 'raw'.
        const resourceType = /\.pdf(\?|$)/i.test(url) ? 'raw' : 'image';
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      }
      return;
    }
    // Local/mock: key is the last path segment of /api/v1/uploads/<key>.
    const key = url.split('/api/')[1] ? url.split('/').pop() : null;
    if (key) removeFile(key);
  } catch (err) {
    logger.warn('Asset cleanup failed (ignored)', { url, message: err?.message });
  }
}

/** Release many assets, ignoring individual failures. */
export async function deleteAssets(urls = []) {
  await Promise.all(urls.filter(Boolean).map((u) => deleteAsset(u)));
}

/**
 * Store an in-memory file and return an absolute, resolvable URL served by this API. Used only
 * in mock mode (no Cloudinary), so uploaded images/PDFs actually render in the UIs.
 */
function mockUrl(file) {
  const key = putFile({
    buffer: file.buffer,
    contentType: file.mimetype,
    filename: file.originalname,
  });
  return `${env.SELF_URL}/api/${env.API_VERSION}/uploads/${key}`;
}

/**
 * Upload one in-memory file buffer. Uses Cloudinary when configured, otherwise returns a
 * deterministic mock URL (dev/test — no network needed).
 * @param {{ buffer: Buffer, mimetype: string, originalname: string }} file
 * @param {string} folder
 * @returns {Promise<string>} secure URL
 */
function uploadOne(file, folder) {
  if (!isCloudinaryConfigured) {
    return Promise.resolve(mockUrl(file));
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload failed', error);
          reject(error);
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(file.buffer);
  });
}

/**
 * Upload multiple files, preserving order.
 * @param {Array<{ buffer: Buffer, mimetype: string, originalname: string }>} files
 * @param {string} [folder]
 * @returns {Promise<string[]>}
 */
export async function uploadImages(files, folder = 'complaints') {
  if (!files || files.length === 0) return [];
  return Promise.all(files.map((file) => uploadOne(file, folder)));
}

/**
 * Upload several attachments (PDF/image) preserving order + original names.
 * @param {Array<{ buffer: Buffer, mimetype: string, originalname: string }>} files
 * @param {string} [folder]
 * @returns {Promise<Array<{ url: string, type: 'pdf'|'image', name: string }>>}
 */
export async function uploadAttachments(files, folder = 'certificates') {
  if (!files || files.length === 0) return [];
  return Promise.all(
    files.map(async (file) => {
      const { url, type } = await uploadAttachment(file, folder);
      return { url, type, name: file.originalname };
    }),
  );
}

/**
 * Upload a raw PDF buffer (e.g. a generated certificate).
 * @param {Buffer} buffer
 * @param {string} [folder]
 * @returns {Promise<string>} secure URL
 */
export async function uploadPdfBuffer(buffer, folder = 'certificates') {
  const { url } = await uploadAttachment(
    { buffer, mimetype: 'application/pdf', originalname: 'certificate.pdf' },
    folder,
  );
  return url;
}

/**
 * Upload a single attachment that may be a PDF or an image. Uses Cloudinary `auto`
 * resource type so PDFs are stored as raw files; falls back to a mock URL when unconfigured.
 * @param {{ buffer: Buffer, mimetype: string, originalname: string }} file
 * @param {string} [folder]
 * @returns {Promise<{ url: string, type: 'pdf'|'image' }>}
 */
export async function uploadAttachment(file, folder = 'notices') {
  const isPdf =
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/x-pdf' ||
    file.originalname?.toLowerCase().endsWith('.pdf');
  const type = isPdf ? 'pdf' : 'image';

  if (!isCloudinaryConfigured) {
    return { url: mockUrl(file), type };
  }

  const url = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary attachment upload failed', error);
          reject(error);
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(file.buffer);
  });

  return { url, type };
}
