import { randomUUID } from 'node:crypto';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { logger } from './logger.js';

/**
 * Upload one in-memory file buffer. Uses Cloudinary when configured, otherwise returns a
 * deterministic mock URL (dev/test — no network needed).
 * @param {{ buffer: Buffer, mimetype: string, originalname: string }} file
 * @param {string} folder
 * @returns {Promise<string>} secure URL
 */
function uploadOne(file, folder) {
  if (!isCloudinaryConfigured) {
    return Promise.resolve(`https://mock.cloudinary.local/${folder}/${randomUUID()}.jpg`);
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
  const type = file.mimetype === 'application/pdf' ? 'pdf' : 'image';

  if (!isCloudinaryConfigured) {
    const ext = type === 'pdf' ? 'pdf' : 'jpg';
    return { url: `https://mock.cloudinary.local/${folder}/${randomUUID()}.${ext}`, type };
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
