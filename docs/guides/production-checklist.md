# Production Readiness Checklist

## Infrastructure

- [x] Backend deploy config (Render blueprint `render.yaml`, health check `/health/ready`).
- [x] Citizen PWA deploy config (Vercel `vercel.json`, SPA rewrites, cache headers).
- [x] Admin portal deploy config (Vercel `vercel.json`).
- [x] MongoDB Atlas guide (indexes, backups, failover) — [mongodb-atlas.md](mongodb-atlas.md).
- [ ] **Ops:** provision Atlas cluster + restrict network access.
- [ ] **Ops:** set all Render/Vercel secrets; wire CORS origins to real Vercel URLs.

## Application

- [x] Env validation (Zod) + production sanity guards.
- [x] Graceful shutdown (SIGTERM/SIGINT) + crash handlers.
- [x] Liveness / readiness / metrics endpoints.
- [x] Structured JSON logs in production; request/error/startup/shutdown logs.
- [x] Provider-agnostic error reporting + Prometheus metrics.

## Security

- [x] JWT, role gates, ownership checks.
- [x] Helmet, strict CORS, rate limiting, mongo-sanitize, upload validation.
- [x] `no-store` caching, HTTPS, secrets in env only.
- Full audit: [security-checklist.md](security-checklist.md).

## Frontend / UX

- [x] PWA installable (manifest + service worker + maskable icons).
- [x] Offline read (Notices/Schemes/Tax/Profile) + offline complaint queue with sync.
- [x] HTTPS-served; asset immutability + SW no-store cache headers.
- [x] Localization EN + MR (key parity verified).
- [x] Accessibility (roles, aria, focus, contrast).
- [x] Error boundaries, skeletons, retry UI.

## Domain features verified

- [x] Notifications (in-app + SMS/voice provider abstraction, broadcast).
- [x] PDF certificate generation (PDFKit) + download gate.
- [x] File uploads (Cloudinary + mock fallback).

## Quality gates

- [x] `npm run lint` clean.
- [x] `npm test` — 166 backend + 15 frontend.
- [x] `npm run build` — both apps, no size warnings.
- [x] Backend coverage ≥ 85% statements / 89% lines.
- [x] CI workflow (lint → test → coverage → build → artifacts).
- [x] E2E journeys authored (Playwright).

## Release

- [x] Release notes v1.0.0, version history, roadmap.
- [x] Admin manual, user manual, operations + maintenance guides.
- [ ] **Ops:** tag `v1.0.0`, deploy, run the UAT checklist against production.
