# Release Notes — v1.0.0

**Digital Gram Panchayat** — first production release. Bilingual (English / Marathi) citizen
services platform for Grampanchayat Sakharale, with an installable offline-capable citizen PWA,
an officer admin portal, and a Node/Express + MongoDB API.

## Highlights

### Citizen

- Register / login (mobile + password), profile management.
- File and track complaints with photos, GPS, and status timeline.
- Apply for certificates (Residence/Income/Birth/Death/Character/Other); download approved PDF.
- View property/water tax dues by year.
- Read notices and government schemes.
- In-app notifications; language + theme + notification settings; onboarding tour.
- **Installable PWA**, full offline reading, and **offline complaint queue with automatic,
  duplicate-safe sync** on reconnect.

### Officer

- Live dashboard (metrics, charts, recent activity).
- Resolve complaints; review/approve/reject certificates (auto PDF, notifications).
- Manage notices, schemes, and tax records.
- Broadcast SMS/voice/in-app notifications.
- User management (activate/deactivate); append-only audit trail.

### Platform

- JWT auth + role gates + ownership checks.
- Idempotent submissions (`Idempotency-Key`).
- Security: Helmet, strict CORS allowlist, route-specific rate limiting, Mongo-sanitization,
  upload validation, `no-store` caching.
- Provider-agnostic notifications (SMS/voice/email) and monitoring (error reporter +
  Prometheus metrics).
- Liveness/readiness/metrics endpoints, graceful shutdown, structured production logs.

## Quality

- Backend: 166 tests, **85%+ statements / 89%+ lines** coverage.
- Frontend: 15 React Testing Library tests; Playwright E2E journeys.
- OpenAPI 3.1 spec (57 paths) + Postman collection (65 requests).
- Full documentation set (guides, manuals, UML).

## Deployment

- Backend → Render (`render.yaml`). Frontends → Vercel (`vercel.json`). Database → MongoDB
  Atlas. CI via GitHub Actions.

## Known limitations (see roadmap)

- SMS/voice use a mock provider until real credentials are configured.
- No refresh-token rotation yet (stateless JWT; logout is client-side).
- Online payment gateway not integrated (tax is record + manual payment entry).

## Upgrade notes

First release — no migration required. Seed an officer account after deploy
(`npm run seed:admin -w backend`).
