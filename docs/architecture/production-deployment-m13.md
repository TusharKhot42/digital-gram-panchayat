# Milestone 13 — Production Deployment, DevOps & Final Release

Deployment/DevOps/release only. No new business features; no API redesign. Health, metrics,
graceful shutdown, and production logging are additive and backward compatible.

## 1. Production Deployment Report

- **Backend → Render** (`render.yaml`): build `npm ci`, start `node backend/src/server.js`,
  health check `/api/v1/health/ready`, secrets via dashboard.
- **Citizen PWA + Admin portal → Vercel** (two projects, `vercel.json` each): Vite build, SPA
  rewrites, immutable asset caching, SW `no-store`.
- **Database → MongoDB Atlas**; **media → Cloudinary**.
- App is production-safe: env sanity guards, graceful shutdown, structured logs, readiness gate.

## 2. Render Deployment Guide

[docs/guides/render-deployment.md](../guides/render-deployment.md) — blueprint + manual
settings, env vars, health checks, post-deploy seeding.

## 3. Vercel Deployment Guide

[docs/guides/vercel-deployment.md](../guides/vercel-deployment.md) — two projects, root
directories, env, CORS wiring, PWA/HTTPS notes.

## 4. MongoDB Atlas Configuration Guide

[docs/guides/mongodb-atlas.md](../guides/mongodb-atlas.md) — cluster, indexes, backups,
connection monitoring, failover.

## 5. GitHub Actions Summary

`.github/workflows/ci.yml` — on push/PR to `main`: `npm ci → lint → test (all workspaces) →
backend coverage → build` and uploads coverage + `dist` artifacts. Deploys are handled by the
Render/Vercel Git integrations, gated on this pipeline.

## 6. Monitoring Architecture

[docs/guides/monitoring.md](../guides/monitoring.md) — provider-agnostic error reporter,
Prometheus metrics at `/api/v1/health/metrics`, structured JSON logs, liveness/readiness. Sentry

- Grafana/Prometheus plug into existing seams (not integrated / no paid deps).

## 7. Backup & Recovery Plan

[docs/guides/backup-recovery.md](../guides/backup-recovery.md) — schedule, `mongodump`/restore,
disaster-recovery checklist, RPO/RTO targets.

## 8. Production Security Checklist

[docs/guides/security-checklist.md](../guides/security-checklist.md) — JWT, CORS, rate limiting,
OWASP protections, upload security, secrets, env. All implemented controls verified.

## 9. UAT Report

[docs/architecture/uat-m13.md](uat-m13.md) — 12 citizen + 8 officer journeys + cross-cutting,
expected results documented. Sign-off: PASS.

## 10. Release Notes v1.0.0

[docs/RELEASE_NOTES.md](../RELEASE_NOTES.md).

## 11–13. Manuals

Administrator ([administrator-manual.md](../guides/administrator-manual.md)), User
([user-manual.md](../guides/user-manual.md)), Maintenance ([maintenance.md](../guides/maintenance.md)),
Operations ([operations-manual.md](../guides/operations-manual.md)).

## 14. Final Project Statistics

- 13 milestones complete.
- Backend: 166 tests / 20 suites, 85%+ statements, 89%+ lines.
- Frontend: 15 React Testing Library tests (citizen 10 + admin 5).
- E2E: 10 Playwright journeys.
- API: OpenAPI 3.1 (57 paths), Postman (65 requests).

## 15. Verification Report

`npm install` ✅ · `npm run lint` ✅ · `npm test` ✅ (166 backend + 15 frontend) ·
`npm run build` ✅ (both apps) · coverage ✅ 85%+ / 89%+.

## 16. Branch Name

`feature/production-deployment`

## 17. Commit Summary

`chore(release): production deployment, DevOps & v1.0.0 release (M13)`
