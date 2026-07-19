# Production Hardening — Phase 2

Enterprise-readiness pass. Every change additive and backward-compatible; no API contract,
JWT, schema, or architecture change. Feature branch: `feature/production-hardening-phase-2`.

## What changed

### Configuration (`config/`)

- `env.js` already fails fast on missing/invalid vars and hard-guards production (rejects
  localhost CORS/Mongo). Added `config/diagnostics.js` — logs a secret-free configuration
  summary at boot and, **in production only**, WARNs when uploads/SMS/translation are on
  their dev fallbacks (e.g. "uploads won't persist without Cloudinary creds"). Warnings,
  never failures — the local fallback stays fully intact.

### Security (`middlewares/`)

- **Explicit CSP.** Helmet now sends `default-src 'none'; frame-ancestors 'none';
base-uri 'none'; form-action 'none'` — safe for a JSON API and defensive if a response is
  ever rendered as a document. HSTS (production) gains `includeSubDomains; preload` + 180d.
- **Per-account login throttle** — 10 / 15 min keyed by `identifier + IP`, layered on the
  existing IP-only `authLimiter`, on `/auth/session`, `/auth/login`, `/admin/login`. Blunts
  single-account brute force from rotating IPs.
- Refresh tokens: designed in `docs/decisions/0001-refresh-token-architecture.md`, isolated
  out of this pass because the correct implementation changes the token transport.

### Observability

- **Request correlation IDs** (`middlewares/request-id.middleware.js`). Every request gets an
  `X-Request-Id` (honoured if the client/proxy sends one, else a UUID), echoed on the
  response and threaded into the timing log line and the error-reporter context. Both SPAs
  send a fresh id per call; the header is CORS-exposed. Ties every log line + reported error
  to one request.
- Already present and unchanged: structured JSON logs in production (`utils/logger.js`),
  provider-agnostic error reporter (`utils/error-reporter.js`, swap via `setErrorReporter`),
  Prometheus metrics at `/api/v1/health/metrics`, liveness + readiness split, slow-request
  logging, graceful shutdown.

### Testing

- Backend `coverageThreshold` gate (stmts 80 / branches 62 / funcs 78 / lines 84) — just
  under current (83/65/82/87). New backend tests: correlation id, CSP header, audit viewer,
  startup diagnostics.
- Frontend: shared media helpers + DocumentViewer tests (citizen suite 10 → 20). This
  surfaced and fixed a real `documentKind` bug (classified by a concatenated `"name url"`
  string, so `.pdf$` never matched a name-only doc).
- Playwright wired into CI as an isolated `e2e` job (mongo service + a `webServer` block that
  self-starts the stack in CI, reuses local servers otherwise).

### Performance

- 5-minute `staleTime` on reference data (notices, schemes) — publish/expiry-gated
  server-side and rarely changing, so this cuts refetches on the most-navigated lists. Live
  data keeps the shorter default.

### Admin

- **Read-only audit log viewer.** The system already wrote a full audit trail; officers now
  have `GET /api/v1/admin/audit` (paginated, filterable by module + action prefix, actor
  resolved to a name) and an Audit page in the sidebar. Append-only trail untouched.

### Code quality

- `.gitattributes` (`text=auto eol=lf`) ends the Windows LF↔CRLF churn.

## Remaining recommendations for production deployment

1. **Set `CLOUDINARY_*`** (or a persistent volume) — uploads on the local fallback do not
   survive a redeploy on ephemeral hosts. The diagnostics WARN now makes this loud at boot.
2. **Real providers** — swap `TRANSLATION_PROVIDER` and `SMS_PROVIDER` off `mock`.
3. **Rotate the seeded admin password** and set a strong production `JWT_SECRET`.
4. **Implement refresh tokens** per ADR 0001, with CSRF protection + e2e coverage.
5. **Password reset flow** (OTP/email) — still routed through the office today.
6. Harden the officer cross-origin token hand-off (single domain or short-lived exchange code).
