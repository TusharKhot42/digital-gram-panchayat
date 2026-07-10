# Milestone 12 — Testing, Documentation & Final QA

Presentation-ready hardening of tests + docs. No new business functionality; no API changed.

## 1. Test Coverage Report (backend)

Measured with `npm run test:coverage -w backend` (scope excludes bootstrap `server.js`,
re-export barrels, and the JSDoc-only provider interface).

| Metric         | Coverage               |
| -------------- | ---------------------- |
| **Statements** | **85.51%** (1281/1498) |
| **Lines**      | **89.48%** (1225/1369) |
| Functions      | 82.95%                 |
| Branches       | 69.06%                 |

Backend tests grew from 122 → **157** (+35): providers, utils (logger/upload/config),
DB lifecycle, tax admin/lookup, certificate review/soft-delete/download, notification
detail/mark-all, user filters, idempotency release, upload limits, and error-middleware
branches.

## 2. Playwright Report

`e2e/` with `playwright.config.js` (projects: `citizen` on Pixel 7, `admin` on Desktop
Chrome). **10 journeys authored + parse-verified** (`npx playwright test --list`):

- Citizen: registration, login, complaint submission + tracking, certificate application,
  tax view.
- Officer: login, complaint resolution, certificate approval, broadcast, user activation.

They exercise a live stack (Mongo + `npm run dev` + `npx playwright install`), so they run on
demand via `npm run e2e` rather than in the default pipeline.

## 3. React Testing Summary

Vitest + React Testing Library + jsdom in both apps. **15 tests / 8 files.**

- Citizen (10): `SkeletonList`, `QueryError` (+ retry), `OfflineBanner` (online/offline),
  `ErrorBoundary` (throw + normal), `useOnline` hook, shared idempotency util.
- Admin (5): `ConnectivityBanner`, `SkeletonRows`, `QueryError`, `ErrorBoundary`.

## 4. API Documentation Summary

Per-module Markdown in `docs/api/` (complaints, notices, schemes, tax, certificates,
dashboard-users, notifications) plus the machine-readable specs below.

## 5. OpenAPI Summary

`docs/api/openapi.yaml` — **OpenAPI 3.1**, 57 paths covering every endpoint across 17 tags.
Bearer JWT security scheme, reusable parameters (Id/Page/Limit/Idempotency-Key), shared
schemas (envelopes, pagination, inputs), and reusable error responses (400/401/403/404/409/429)
with examples. Validated: no duplicate paths, no tabs.

## 6. Postman Collection Summary

`docs/api/postman_collection.json` (v2.1) — **12 folders, 65 requests** covering all
endpoints. Collection variables (`baseUrl`, `token`, `adminToken`, entity ids); login requests
auto-capture the JWT into `{{token}}`/`{{adminToken}}` via test scripts; multipart examples for
uploads; `{{$guid}}` Idempotency-Key on complaint create. Env file:
`docs/api/postman_environment.json`.

## 7. Documentation Summary

- **README** rewritten to reflect the finished platform.
- **Guides** (`docs/guides/`): installation, developer-guide, deployment, architecture,
  database, environment, folder-structure, tech-stack, troubleshooting.
- **Architecture notes:** blueprint, pwa-offline, production-hardening (existing) + this report.

## 8. UML Summary

`docs/uml/uml.md` — 9 Mermaid diagrams: **Use Case, Class, Component, Deployment, two
Sequence (offline-idempotent complaint sync; certificate approval), ER, Activity, Package.**

## 9. QA Report

| Area              | Verified by                                                           |
| ----------------- | --------------------------------------------------------------------- |
| Authentication    | auth + hardening tests (register/login, JWT)                          |
| Authorization     | 401 no-token, 403 citizen-on-officer (hardening)                      |
| Offline mode      | `useOnline`/`OfflineBanner` RTL + offline-queue design (M10)          |
| Notifications     | notification + notification-extra tests (create/broadcast/mark/retry) |
| PDF generation    | pdf.service unit + certificate approve integration                    |
| Uploads           | MIME allowlist + too-many-files (hardening/edge tests)                |
| Role restrictions | role middleware + per-module 403 tests                                |
| Localization      | EN/MR key-parity check (citizen 267, admin 406)                       |
| PWA installation  | manifest + SW build artifacts (M10), install prompt                   |
| Accessibility     | RTL role/aria assertions + a11y attributes (M11)                      |

## 10. Coverage Percentage

**Backend: 85.51% statements / 89.48% lines** (target ≥85% met). Frontend + E2E covered by
Vitest (15) and Playwright (10 journeys).

## 11. Verification Report

| Step                               | Result                                      |
| ---------------------------------- | ------------------------------------------- |
| `npm install`                      | ✅                                          |
| `npm run lint` (whole repo)        | ✅ 0 errors, 0 warnings                     |
| `npm test` (all workspaces)        | ✅ 172 (backend 157 + citizen 10 + admin 5) |
| `npm run build`                    | ✅ both apps, no 500 kB warning             |
| `npm run test:coverage -w backend` | ✅ 85.51% stmts / 89.48% lines              |
| `npx playwright test --list`       | ✅ 10 specs parse                           |
| OpenAPI / Postman JSON validity    | ✅                                          |

## 12. Branch Name

`feature/testing-docs-qa`

## 13. Commit Summary

`test(qa): raise backend coverage to 85%+, add RTL + Playwright, OpenAPI/Postman, docs & UML (M12)`
