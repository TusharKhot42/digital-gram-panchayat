# ADR 0001 — Refresh-token architecture

**Status:** Designed, not yet implemented (deliberately isolated).
**Date:** Production Hardening Phase 2.

## Context

Authentication is a stateless JWT: `signToken()` issues a token with `{ role, sub }` and a
role-based expiry (24h citizen / 8h officer). The token is stored in `localStorage` and sent
as a `Bearer` header (`services/api-client.js`). There is no refresh token and no server-side
revocation — a leaked token is valid until it expires, and "log out everywhere" is impossible.

Phase 2 asked for a refresh-token architecture "implemented if compatible."

## Decision

**Document the design now; do not wire it in this pass**, because a correct implementation
changes the token _transport_, which is the one thing most likely to break the working auth
flow across two separately-deployed origins:

- Refresh tokens must be **httpOnly, Secure, SameSite cookies** (not `localStorage`) or they
  offer no security benefit over the access token they protect.
- The two SPAs authenticate cross-origin (`5173`/`5174` in dev, separate Vercel domains in
  prod) and hand the officer token off via a URL fragment. Introducing cookies means solving
  cross-site cookie + CSRF + CORS-credentials for both origins simultaneously — a breaking,
  hard-to-reverse change that deserves its own phase with e2e coverage.

## Target design (for the implementing phase)

1. **Tokens**
   - Access token: short-lived (~15 min), JWT, `Bearer` header — unchanged shape.
   - Refresh token: opaque random id, ~30 days, stored **hashed** in a `refresh_tokens`
     collection `{ userId, tokenHash, family, expiresAt, revokedAt }`, delivered as an
     httpOnly Secure SameSite=Strict cookie scoped to `/api/v1/auth`.

2. **Endpoints** (all additive — existing login endpoints keep working)
   - `POST /auth/refresh` — reads the cookie, verifies the hash, **rotates** it (issue new
     refresh, revoke old), returns a new access token. Reuse of a revoked token revokes the
     whole `family` (token-theft detection).
   - `POST /auth/logout` — revokes the current refresh token + clears the cookie (today's
     logout only drops the client token).
   - `POST /auth/logout-all` — revokes every refresh token for the user.

3. **Client** — a 401 interceptor calls `/auth/refresh` once, retries the original request,
   and only bounces to login if refresh fails. `AuthProvider` already listens for
   `auth:unauthorized`, so the wiring point exists.

4. **Migration / backward compatibility** — the access-token flow is unchanged, so existing
   sessions keep working. Refresh is opt-in per client; a client that never calls `/refresh`
   behaves exactly as today until its access token expires.

## Consequences

- Until implemented: shorter-lived tokens + the per-account login throttle (added this phase)
  are the mitigations; `security-checklist.md` lists refresh/rotation as an open item.
- When implemented: needs CSRF protection on cookie-authenticated routes and an e2e test for
  the rotate-and-reuse-detection path before it ships.
