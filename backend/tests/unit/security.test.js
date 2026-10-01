import jwt from 'jsonwebtoken';
import { signToken, verifyToken } from '../../src/utils/jwt.js';
import { signatureMatches } from '../../src/utils/file-signature.js';
import { env } from '../../src/config/env.js';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const PDF = Buffer.from('%PDF-1.7\n...');
const HTML = Buffer.from('<html><script>alert(1)</script>');

describe('jwt hardening', () => {
  test('a token this app signs verifies back', () => {
    const token = signToken({ id: '507f1f77bcf86cd799439011', role: 'citizen' });
    const payload = verifyToken(token);
    expect(payload.sub).toBe('507f1f77bcf86cd799439011');
    expect(payload.role).toBe('citizen');
  });

  test('rejects a token with no issuer/audience (wrong signer profile)', () => {
    const forged = jwt.sign({ role: 'officer' }, env.JWT_SECRET, {
      subject: 'abc',
      expiresIn: '1h',
    });
    expect(() => verifyToken(forged)).toThrow();
  });

  test('rejects an alg:none token', () => {
    const none = jwt.sign({ role: 'officer' }, '', {
      algorithm: 'none',
      subject: 'abc',
      issuer: 'dgp-api',
      audience: 'dgp-client',
    });
    expect(() => verifyToken(none)).toThrow();
  });

  test('rejects a token signed with the wrong secret', () => {
    const wrong = jwt.sign({ role: 'citizen' }, 'a'.repeat(40), {
      subject: 'abc',
      issuer: 'dgp-api',
      audience: 'dgp-client',
      expiresIn: '1h',
    });
    expect(() => verifyToken(wrong)).toThrow();
  });
});

describe('file signature validation', () => {
  test('accepts real image / pdf bytes matching their type', () => {
    expect(signatureMatches(PNG, 'image/png')).toBe(true);
    expect(signatureMatches(JPEG, 'image/jpeg')).toBe(true);
    expect(signatureMatches(PDF, 'application/pdf')).toBe(true);
    // PDF with UTF-8 BOM or leading header bytes
    const pdfWithBom = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), PDF]);
    expect(signatureMatches(pdfWithBom, 'application/pdf')).toBe(true);
  });

  test('rejects a spoofed file (HTML bytes labelled image/png)', () => {
    expect(signatureMatches(HTML, 'image/png')).toBe(false);
  });

  test('rejects a PNG labelled as a PDF and vice versa', () => {
    expect(signatureMatches(PNG, 'application/pdf')).toBe(false);
    expect(signatureMatches(PDF, 'image/png')).toBe(false);
  });

  test('rejects an unknown declared type', () => {
    expect(signatureMatches(HTML, 'text/html')).toBe(false);
  });
});
