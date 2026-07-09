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
