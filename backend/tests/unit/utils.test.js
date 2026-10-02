import { logger } from '../../src/utils/logger.js';
import { env } from '../../src/config/env.js';
import {
  uploadImages,
  uploadAttachment,
  uploadAttachments,
  uploadPdfBuffer,
  deleteAsset,
  deleteAssets,
} from '../../src/utils/upload.js';
import { clearStore } from '../../src/features/uploads/upload-store.js';
import * as configBarrel from '../../src/config/index.js';

const imageFile = {
  buffer: Buffer.from('fake-image'),
  mimetype: 'image/png',
  originalname: 'photo.png',
};
const pdfFile = {
  buffer: Buffer.from('%PDF-1.4 fake'),
  mimetype: 'application/pdf',
  originalname: 'doc.pdf',
};

describe('logger', () => {
  test('every level is callable without throwing', () => {
    expect(() => {
      logger.fatal('fatal');
      logger.error('error', { a: 1 });
      logger.warn('warn');
      logger.info('info');
      logger.debug('debug');
      logger.trace('trace');
    }).not.toThrow();
  });

  test('production mode emits structured single-line JSON with merged context + error', () => {
    const prev = env.NODE_ENV;
    const prevLevel = env.LOG_LEVEL;
    env.NODE_ENV = 'production';
    const seen = [];
    const original = console.error;
    console.error = (line) => seen.push(line);
    try {
      logger.error('boom happened', { requestId: 'r1' }, new Error('kaboom'), 'extra');
      expect(seen).toHaveLength(1);
      const parsed = JSON.parse(seen[0]);
      expect(parsed).toMatchObject({ level: 'error', msg: 'boom happened', requestId: 'r1' });
      expect(parsed.error.message).toBe('kaboom');
      expect(parsed.detail).toBe('extra');
    } finally {
      console.error = original;
      env.NODE_ENV = prev;
      env.LOG_LEVEL = prevLevel;
    }
  });
});

describe('upload (Cloudinary unconfigured -> served mock URLs)', () => {
  test('uploadImages returns one served URL per file, preserving order', async () => {
    const urls = await uploadImages([imageFile, imageFile], 'complaints');
    expect(urls).toHaveLength(2);
    urls.forEach((u) => expect(u).toMatch(/\/api\/v1\/uploads\//));
  });

  test('uploadImages on empty input returns []', async () => {
    expect(await uploadImages([])).toEqual([]);
    expect(await uploadImages(undefined)).toEqual([]);
  });

  test('uploadAttachment classifies pdf vs image', async () => {
    const pdf = await uploadAttachment(pdfFile, 'certificates');
    expect(pdf.type).toBe('pdf');
    expect(pdf.url).toMatch(/\/api\/v1\/uploads\//);
    const img = await uploadAttachment(imageFile, 'notices');
    expect(img.type).toBe('image');
    expect(img.url).toMatch(/\/api\/v1\/uploads\//);
  });

  test('uploadAttachments preserves original names', async () => {
    const out = await uploadAttachments([pdfFile], 'certificates');
    expect(out[0]).toMatchObject({ type: 'pdf', name: 'doc.pdf' });
  });

  test('uploadPdfBuffer returns a served URL', async () => {
    const url = await uploadPdfBuffer(Buffer.from('%PDF'), 'certificates');
    expect(url).toMatch(/\/api\/v1\/uploads\//);
  });

  test('deleteAsset and deleteAssets safely remove files or no-op on invalid', async () => {
    await expect(deleteAsset(null)).resolves.toBeUndefined();
    await expect(deleteAsset('http://not-an-upload.com')).resolves.toBeUndefined();
    const url = await uploadPdfBuffer(Buffer.from('%PDF'), 'test');
    await expect(deleteAsset(url)).resolves.toBeUndefined();
    await expect(deleteAssets([url, null])).resolves.toBeUndefined();
  });

  test('clearStore empties the upload store without throwing', () => {
    expect(() => clearStore()).not.toThrow();
  });
});

describe('config barrel', () => {
  test('re-exports env and db helpers', () => {
    expect(configBarrel.env).toBeDefined();
    expect(typeof configBarrel.connectDatabase).toBe('function');
    expect(typeof configBarrel.disconnectDatabase).toBe('function');
  });
});
