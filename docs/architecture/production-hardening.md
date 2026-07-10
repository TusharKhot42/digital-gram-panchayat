# Production Hardening (M11)

No new business module, no architecture change, backward compatible. Idempotency, CORS
allowlist and rate limits are additive; no existing endpoint changed shape. Route-specific
limiters are skipped under `NODE_ENV=test`.

## 1. Security Report

| Control                               | Status | Where                                                                             |
| ------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| Helmet security headers               | ✅     | `securityHeaders()` — CSP off (JSON API), CORP cross-origin, HSTS in prod         |
| `x-powered-by` disabled               | ✅     | `app.disable('x-powered-by')`                                                     |
| Strict CORS allowlist                 | ✅     | `strictCors()` — only citizen/admin origins; unknown → 403 `CORS_FORBIDDEN`       |
| Compression                           | ✅     | `compression()`                                                                   |
| Request size limits                   | ✅     | `express.json({ limit: '1mb' })` + urlencoded 1mb                                 |
| Mongo injection protection            | ✅     | `express-mongo-sanitize` strips `$`/`.` keys                                      |
| Upload validation / MIME verification | ✅     | multer `fileFilter` mimetype allowlist + size cap (memory storage, no disk)       |
| Secure filename handling              | ✅     | files never written to disk; stored under generated UUID URLs (`utils/upload.js`) |
| HTTP security headers                 | ✅     | Helmet + `X-Response-Time`                                                        |
| Cache headers                         | ✅     | `Cache-Control: no-store` on all `/api` responses                                 |
| Consistent error responses            | ✅     | uniform `{ success, error:{ code, message, fields } }` envelope everywhere        |

XSS: React escapes all rendered text (no `dangerouslySetInnerHTML`); inputs are
validation-constrained and Mongo-sanitized; Helmet sets `X-Content-Type-Options: nosniff`.

## 2. Rate Limiting

`express-rate-limit`, uniform 429 envelope (`createRateLimiter`):

| Scope                             | Window | Max | Code                       |
| --------------------------------- | ------ | --- | -------------------------- |
| Authentication (login/register)   | 15 min | 20  | `AUTH_RATE_LIMITED`        |
| Complaint submission              | 1 h    | 30  | `COMPLAINT_RATE_LIMITED`   |
| Certificate apply                 | 1 h    | 30  | `CERTIFICATE_RATE_LIMITED` |
| Broadcast (notice + notification) | 1 h    | 10  | `BROADCAST_RATE_LIMITED`   |
| General API                       | 15 min | 100 | `RATE_LIMITED`             |

## 3. Accessibility Report

- Global focus-visible rings on all interactive controls (buttons, retry, inputs).
- ARIA: `role="alert"` on error/boundary states; `aria-busy`/`aria-live` on skeleton lists;
  `aria-label` on search inputs and filter selects; `aria-hidden` on decorative icons.
- Form fields use `<label>` (RHF forms) or `aria-label` (search/filter).
- Keyboard: native semantic elements (`button`, `select`, `a`) throughout — fully tabbable.
- Screen reader: error boundaries and query errors announce via `role="alert"`.
- Contrast: brand green `#15803d` on white ≥ 4.5:1; theme-aware tokens in both modes.

## 4. Database Optimization Report

- **Indexes** verified on every collection: users (mobile/email sparse-unique, role),
  complaints (citizenId+status, status, createdAt, human id), certificates, tax, schemes,
  notices, notifications (recipient+read, human ids), audit (entity+entityId, actor, at),
  idempotency (unique key + 24h TTL).
- **lean()** on internal reads where shape is irrelevant (broadcast recipients via
  `.select('mobile').lean()`, dashboard activity feed).
- **Projections** on recipient lookups (`.select('mobile')`).
- **Aggregation** for dashboard metrics/charts (`$group`/`$sum`), no N+1.
- **Promise.all** for parallel counts and list+count pagination.
- **Pagination** on every list endpoint (page/limit/total).
- 60s in-memory dashboard aggregate cache (production only).

## 5. Middleware Report

Order in `createApp()`: `trust proxy` → Helmet → strict CORS → compression → body parsers
(1mb) → mongo-sanitize → request timing → morgan → `/api` router (`no-store` → general
limiter → feature routers). Route-specific limiters run first in their router chains.
Terminates in `notFoundMiddleware` → `errorMiddleware`.

New middleware: `security.middleware.js`, `rate-limit.middleware.js`,
`request-timing.middleware.js`.

## 6. Error Handling Report

- Central `errorMiddleware`: `AppError` → typed envelope; `ZodError`/validation → 400 with
  field map; Mongo 11000 → 409; unknown → 500 (message hidden in production) and routed to
  `reportError`.
- `reportError` / `setErrorReporter`: provider-agnostic sink (default = logger). **No Sentry**
  dependency — a real provider can be attached without touching call sites.
- Frontend: global `ErrorBoundary` (both apps) catches render crashes with a recoverable
  fallback; `QueryError` gives inline retry on failed queries; offline-aware messaging.

## 7. Audit Coverage Report

Every mutation writes an `AuditLog` (verified). Coverage:

| Module        | Audited actions                                     |
| ------------- | --------------------------------------------------- |
| Complaints    | create, status.update                               |
| Notices       | create, update, publish, archive, delete, broadcast |
| Schemes       | create, update, publish/archive, delete             |
| Tax           | create, update, payment                             |
| Certificates  | apply, review, approve, reject, delete              |
| Users         | status change                                       |
| Notifications | notify (create), broadcast                          |

No missing audit events found. Audit writes are non-blocking (failure never breaks the action).

## 8. Test Summary

13 new tests across 2 files (`hardening.test.js`, `unit/monitoring.test.js`):
helmet headers + `no-store` + `X-Response-Time`, CORS rejection, Mongo-injection login,
authorization (401/403), upload MIME rejection, audit-log write, pagination slicing,
performance helpers (`startTimer`/`measure`), error-reporter abstraction, rate-limit 429
envelope. **Total: 122 passing (12 suites → now 12 files, +13 cases over M10's 109.)**

## 9. Verification Report

| Step                              | Result                            |
| --------------------------------- | --------------------------------- |
| `npm install`                     | ✅ 0 vulnerabilities              |
| `npm run lint`                    | ✅ 0 errors, 0 warnings           |
| `npm test` (backend)              | ✅ 122/122                        |
| `npm run build` (citizen + admin) | ✅ both, no 500 kB warning        |
| i18n EN/MR parity                 | ✅ citizen 267=267, admin 406=406 |

## 10. Branch Name

`feature/production-hardening`

## 11. Commit Summary

`chore(prod): security, rate limiting, monitoring, reliability & a11y hardening (M11)` —
backend security/rate-limit/monitoring middleware, DB + audit verification, citizen/admin
error boundaries + skeletons + retry + query tuning + lazy charts, and hardening tests.
