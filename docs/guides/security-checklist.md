# Production Security Checklist

Final audit against the app's implemented controls (see also
[production-hardening.md](../architecture/production-hardening.md)).

## Authentication & sessions

- [x] Passwords hashed with bcrypt (never stored/returned; `toJSON` strips `passwordHash`).
- [x] JWT (HS256) signed with a ≥32-char secret enforced by env validation.
- [x] Separate citizen/officer token lifetimes (24h / 8h).
- [x] 401 clears the client token and redirects to login.
- [ ] **Ops:** rotate `JWT_SECRET` periodically; store only in Render secrets.

## Authorization

- [x] Role gate middleware (`authorize`) on every officer route.
- [x] Ownership checks in services (citizens read only their own records).
- [x] Verified by tests: 401 (no token), 403 (citizen on officer route).

## Transport & headers

- [x] Helmet (nosniff, frameguard, HSTS in production).
- [x] `x-powered-by` disabled.
- [x] HTTPS everywhere (Vercel + Render TLS).
- [x] `Cache-Control: no-store` on all API responses.

## CORS

- [x] Strict allowlist (citizen + admin origins only); unknown origin → 403.
- [x] Production boot fails if origins are localhost.

## Rate limiting (429)

- [x] Auth (strict), complaint/certificate (medium), broadcast (strict), general (standard).
- [x] `trust proxy` set so client IPs are correct behind Render.

## Input & injection (OWASP)

- [x] express-validator on all mutating routes.
- [x] `express-mongo-sanitize` strips `$`/`.` operators (NoSQL injection).
- [x] React auto-escaping; no `dangerouslySetInnerHTML` (XSS).
- [x] Idempotency prevents duplicate submissions/replays.
- [x] Consistent error envelope; internal messages hidden in production.

## File uploads

- [x] MIME allowlist (images: jp/png/webp; docs: +pdf).
- [x] Size caps (5 MB) + max-count limits.
- [x] Memory storage → streamed to Cloudinary; never written to disk.
- [x] Server-generated storage names (no client filename trust).

## Secrets & config

- [x] All secrets via env; `.env*` gitignored; `.env.example` templates only.
- [x] Zod fail-fast validation + production sanity guards.
- [ ] **Ops:** restrict Atlas network access to Render egress IPs (not `0.0.0.0/0`).

## Data & audit

- [x] Append-only audit log for every mutation.
- [x] Soft-delete (no destructive removes).
- [x] Idempotency keys auto-expire (TTL).

## Residual / future (Phase 2)

- [ ] Refresh-token rotation + token revocation list.
- [ ] Account lockout / CAPTCHA after repeated auth failures.
- [ ] Dependency scanning (Dependabot) + `npm audit` gate in CI.
- [ ] WAF / DDoS protection at the edge.
