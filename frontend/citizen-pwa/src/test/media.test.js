import { thumbnailUrl, previewUrl, documentKind } from '@dgp/shared';

const CLOUDINARY = 'https://res.cloudinary.com/demo/image/upload/v1/schemes/abc.jpg';
const LOCAL = 'http://localhost:5000/api/v1/uploads/uuid-key';

describe('media helpers', () => {
  describe('thumbnailUrl', () => {
    it('injects a resize transform into a Cloudinary URL', () => {
      expect(thumbnailUrl(CLOUDINARY, 320)).toBe(
        'https://res.cloudinary.com/demo/image/upload/c_fill,w_320,q_auto,f_auto/v1/schemes/abc.jpg',
      );
    });
    it('leaves a local/mock URL untouched', () => {
      expect(thumbnailUrl(LOCAL, 320)).toBe(LOCAL);
    });
    it('is a no-op for empty input', () => {
      expect(thumbnailUrl('')).toBe('');
    });
  });

  describe('previewUrl', () => {
    it('uses a bounded (non-crop) transform on Cloudinary URLs', () => {
      expect(previewUrl(CLOUDINARY)).toContain('/upload/c_limit,w_1000,q_auto,f_auto/');
    });
  });

  describe('documentKind', () => {
    it('prefers an explicit type', () => {
      expect(documentKind({ type: 'pdf', url: 'x.jpg' })).toBe('pdf');
    });
    it('falls back to the extension', () => {
      expect(documentKind({ url: 'file.PNG' })).toBe('image');
      expect(documentKind({ url: 'form.pdf' })).toBe('pdf');
      expect(documentKind({ name: 'report.pdf' })).toBe('pdf');
    });
    it('returns "file" for unknown kinds', () => {
      expect(documentKind({ url: 'archive.zip' })).toBe('file');
      expect(documentKind({})).toBe('file');
    });
  });
});
