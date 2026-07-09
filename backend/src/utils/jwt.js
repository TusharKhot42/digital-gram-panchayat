import jwt from 'jsonwebtoken';
import { ROLES } from '@dgp/shared';
import { env } from '../config/env.js';

/**
 * Sign a stateless JWT. Citizens get the longer expiry, officers the shorter one
 * (blueprint: 24h citizen / 8h officer).
 * @param {{ id: string, role: 'citizen'|'officer' }} params
 * @returns {string}
 */
export function signToken({ id, role }) {
  const expiresIn = role === ROLES.OFFICER ? env.JWT_EXPIRY_OFFICER : env.JWT_EXPIRY_CITIZEN;
  return jwt.sign({ role }, env.JWT_SECRET, { subject: String(id), expiresIn });
}

/**
 * Verify a JWT and return its payload. Throws on invalid/expired token.
 * @param {string} token
 * @returns {{ sub: string, role: 'citizen'|'officer', iat: number, exp: number }}
 */
export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
