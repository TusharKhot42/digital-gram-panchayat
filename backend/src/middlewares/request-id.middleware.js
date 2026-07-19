import { randomUUID } from 'node:crypto';
import { REQUEST_ID_HEADER } from '@dgp/shared';

// A UUID or an opaque client id up to 128 chars; anything longer/weirder is replaced so a
// crafted header can't pollute logs.
const SAFE_ID = /^[A-Za-z0-9._-]{1,128}$/;

/**
 * Assigns a correlation id to every request and echoes it back on the response. If the client
 * (or an upstream proxy / API gateway) already sent one it is honoured, so a single id can
 * follow a request across services; otherwise a UUID is generated. `req.id` is read by the
 * logger and the error reporter so every log line and reported error can be tied to one
 * request. Purely additive — nothing depends on the id being present.
 */
export function requestId(req, res, next) {
  const incoming = req.get(REQUEST_ID_HEADER);
  req.id = incoming && SAFE_ID.test(incoming) ? incoming : randomUUID();
  res.set(REQUEST_ID_HEADER, req.id);
  next();
}
