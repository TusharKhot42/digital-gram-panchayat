import jwt from 'jsonwebtoken';
import { ROLES } from '@dgp/shared';
import { env } from '../config/env.js';

// Pin the algorithm, issuer and audience so a token can't be replayed with a swapped
// algorithm (e.g. an `alg: none` or RS/HS confusion attack) or accepted by another service.
const ALGORITHM = 'HS256';
const ISSUER = 'dgp-api';
const AUDIENCE = 'dgp-client';

/**
 * Sign a stateless JWT. Citizens get the longer expiry, officers the shorter one
 * (blueprint: 24h citizen / 8h officer).
 * @param {{ id: string, role: 'citizen'|'officer', ward?: string }} params
 * @returns {string}
 */
export function signToken({ id, role, ward, isRootAdmin }) {
  const expiresIn = role === ROLES.OFFICER ? env.JWT_EXPIRY_OFFICER : env.JWT_EXPIRY_CITIZEN;
  const payload = { role };
  if (ward) payload.ward = ward;
  if (isRootAdmin) payload.isRootAdmin = true;
  return jwt.sign(payload, env.JWT_SECRET, {
    subject: String(id),
    expiresIn,
    algorithm: ALGORITHM,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

/**
 * Verify a JWT and return its payload. Throws on an invalid/expired token, a non-HS256
 * algorithm, or a mismatched issuer/audience.
 * @param {string} token
 * @returns {{ sub: string, role: 'citizen'|'officer', iat: number, exp: number }}
 */
export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: [ALGORITHM],
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}
