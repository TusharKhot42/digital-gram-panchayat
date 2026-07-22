import { randomBytes } from 'node:crypto';
import QRCode from 'qrcode';
import { env } from '../../config/env.js';

/**
 * Certificate verification helpers.
 *
 * A `verificationId` is an opaque, unguessable token minted once per issued certificate. It is
 * embedded in the QR code and forms the public verification URL — so scanning the QR opens the
 * citizen app's verification page for that certificate, and the id is safe to expose (it reveals
 * only what the verify endpoint already returns).
 */

/** Mint a fresh, URL-safe verification token. */
export function generateVerificationId() {
  return randomBytes(16).toString('hex');
}

/** Absolute URL of the public verification page for a certificate. */
export function verificationUrl(verificationId) {
  const base = env.CORS_ORIGIN_CITIZEN.replace(/\/$/, '');
  return `${base}/verify/${verificationId}`;
}

/**
 * Render the verification URL as a PNG QR code buffer for embedding in the PDF.
 * @param {string} verificationId
 * @returns {Promise<Buffer>}
 */
export function generateQrPngBuffer(verificationId) {
  return QRCode.toBuffer(verificationUrl(verificationId), {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 220,
    color: { dark: '#0F172A', light: '#FFFFFF' },
  });
}
