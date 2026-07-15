import { Router } from 'express';
import { getFile } from './upload-store.js';

/**
 * Serves mock-mode uploads by key. Public + cacheable (overrides the API's default no-store,
 * since these are opaque asset bytes, not citizen records). Mounted at /api/v1/uploads.
 */
export const uploadsRouter = Router();

uploadsRouter.get('/:key', (req, res) => {
  const file = getFile(req.params.key);
  if (!file) {
    res
      .status(404)
      .json({ success: false, error: { code: 'NOT_FOUND', message: 'File not found' } });
    return;
  }
  res.set('Cache-Control', 'public, max-age=86400');
  res.set('Content-Type', file.contentType || 'application/octet-stream');
  res.send(file.buffer);
});
