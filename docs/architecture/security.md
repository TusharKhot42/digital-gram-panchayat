# Security posture

A practical, honest inventory of the portal's security controls — what is enforced in code,
and what the deployment still owns. Threat model: a public government portal with citizen PII
(names, mobile numbers, addresses, uploaded ID documents) and officer-only administrative
actions.

## Enforced in code

### Authentication & sessions

- **Bearer JWT**, stateless. Signed **HS256 with a pinned algorithm, issuer (`dgp-api`) and
  audience (`dgp-client`)** — a token can't be replayed with a swapped algorithm (`alg:none`,
  HS/RS confusion) or accepted across services (`utils/jwt.js`).
- `JWT_SECRET` is required to be ≥ 32 chars (env validation fails boot otherwise).
- Every authenticated request re-loads the user and rejects if the account is missing or
  **deactivated** — a disabled account's token stops working on the next request, without a
  server-side session store (`middlewares/auth.middleware.js`).
- Separate, shorter expiry for officers (8h) than citizens (24h).
- **Passwords** hashed with bcrypt; minimum length raised to **8**; login and registration are
  rate-limited per IP _and_ per account (`loginThrottle`) to blunt credential stuffing.

### Authorization

- Role middleware (`authorize`) gates every officer route; citizen data endpoints check
  ownership (owner-or-officer) before returning a record.

### Input handling & injection

- **NoSQL injection**: `express-mongo-sanitize` strips `$`/`.` operators from payloads.
- **Validation**: express-validator / zod on every write route; query `limit` clamped (DoS
  guard). Body size capped at 1 MB.
- **Path traversal**: the mock file store only serves keys matching a strict UUID pattern, so a
  crafted `../` key can't walk the filesystem (`uploads/upload-store.js`).

### File uploads

- Memory storage (never written to a web-served path in Cloudinary mode), 5 MB/file cap, count
  caps per feature.
- **Content-based type check**: beyond the client-supplied mimetype (spoofable), the real
  leading bytes must match the declared type — JPEG/PNG/WEBP/PDF magic numbers
  (`utils/file-signature.js`). A file's bytes labelled `image/png` that are actually HTML are
  rejected. Combined with `X-Content-Type-Options: nosniff`, a mislabelled upload can't be
  sniffed and executed.

### Transport & headers

- **Helmet**: strict CSP (`default-src 'none'` — the API serves only JSON), `nosniff`,
  frameguard, `frame-ancestors 'none'`, `base-uri 'none'`, `form-action 'none'`; **HSTS** in
  production; `x-powered-by` disabled.
- **Strict CORS allowlist** — only the two known frontends; credentials mode on.
- **No-store** cache header on every API response (citizen/officer data never cached).
- `trust proxy` set so client IPs and protocol are read correctly behind the load balancer.

### CSRF

- Auth is a **Bearer token in the `Authorization` header**, not an ambient cookie, so classic
  CSRF (which rides cookies) does not apply — a cross-site page can't read the token to set the
  header. No cookie-based session exists.

### Auditing & abuse

- Every state change writes an append-only `auditlogs` entry (actor, action, before/after).
- Idempotency keys on unsafe replays; rate limiters per feature; error responses never leak
  stack traces in production (`middlewares/error.middleware.js`).

## Owned by the deployment (not code)

1. **HTTPS/TLS termination** at the proxy/CDN + HTTP→HTTPS redirect (HSTS is already sent).
2. **Shared rate-limit store (Redis)** — the current limiter is in-memory per instance, so
   limits are per-process across a horizontally-scaled fleet (see `scaling.md`).
3. **Secret management** — `JWT_SECRET`, Cloudinary and SMS keys from a secrets manager, not
   committed `.env`.
4. **WAF / DDoS protection** and network-level rate limiting at the edge.
5. **Dependency patching** — run `npm audit` in CI. Note: the flagged `react-router` advisory
   (GHSA-qwww-vcr4-c8h2) is an **RSC-mode** CSRF bypass; this app uses React Router only as a
   client-side SPA (`createBrowserRouter`, no RSC server or server actions), so it is **not
   exploitable here** — upgrade on the next major bump rather than forcing a breaking change.

## Recommended next hardening (not yet done)

- **Refresh-token rotation** with a revocation list (short access token + rotating refresh),
  documented in the refresh-token ADR — closes the "can't revoke a live JWT before expiry" gap.
- **Password complexity** (letter + number, breach-list check) on top of the length minimum.
- **2FA / OTP** for officer logins.
- **CAPTCHA** on registration/login if bot abuse appears.
- **Virus scanning** (ClamAV) of uploaded documents before they're served.
