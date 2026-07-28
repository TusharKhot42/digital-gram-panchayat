import { Router } from 'express';
import { env } from '../../config/env.js';
import { getFile } from './upload-store.js';

/**
 * Serves mock-mode uploads by key. Public + cacheable (overrides the API's default no-store,
 * since these are opaque asset bytes, not citizen records). Mounted at /api/v1/uploads.
 */
export const uploadsRouter = Router();

// The API's global helmet config sends `X-Frame-Options` + CSP `frame-ancestors 'none'`, which
// would stop the in-app document viewer from embedding a served PDF/image in an <iframe>. These
// are opaque public assets meant to be embedded, so for this route only we replace that with a
// frame-ancestors allowlist of our own frontends (mock storage / local dev; in production the
// bytes come from Cloudinary, which sets its own permissive framing).
const FRAME_ANCESTORS = ["'self'", env.CORS_ORIGIN_CITIZEN, env.CORS_ORIGIN_ADMIN].join(' ');

uploadsRouter.get('/:key', (req, res) => {
  const file = getFile(req.params.key);
  if (!file) {
    res
      .status(404)
      .json({ success: false, error: { code: 'NOT_FOUND', message: 'File not found' } });
    return;
  }
  res.removeHeader('X-Frame-Options');
  res.set('Content-Security-Policy', `frame-ancestors ${FRAME_ANCESTORS}`);
  res.set('Cache-Control', 'public, max-age=86400');
  res.set('Content-Type', file.contentType || 'application/octet-stream');
  res.set('X-Content-Type-Options', 'nosniff');
  res.send(file.buffer);
});
