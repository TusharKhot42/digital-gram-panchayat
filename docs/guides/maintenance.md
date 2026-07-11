# Maintenance Guide

## Dependencies

- Update within a branch: `npm outdated`, bump, then `npm install` at the root.
- Always run the gate afterwards: `npm run lint && npm test && npm run build`.
- Security: `npm audit` monthly; enable Dependabot for automated PRs (Phase 2).
- Node stays on the LTS pinned in `.nvmrc` (20) and `engines`.

## Codebase conventions

- Feature-folder layering (`routes → controller → service → model`); logic in services.
- Shared shapes in `@dgp/shared` — never duplicate.
- Every mutation writes an audit log; every response uses the uniform envelope.
- No hardcoded UI strings — add EN + MR keys (parity is checked).
  Full conventions: [developer-guide.md](developer-guide.md).

## Adding / changing an endpoint

1. Update shared schema (if shared) → validation → service (+ audit) → controller → route.
2. Add tests (integration for the route, unit for pure logic).
3. Update `docs/api/openapi.yaml` + Postman collection.
4. Keep it backward compatible; new cross-cutting behaviour should be additive/opt-in.

## Tests & coverage

- Backend: `npm run test:coverage -w backend` (target ≥85% statements). Add tests for any new
  service/route/branch.
- Frontend: `npm test -w frontend/citizen-pwa` / `-w frontend/admin-portal`.
- E2E: `npm run e2e` against a running stack.

## Data maintenance

- Idempotency keys auto-expire (TTL 24h) — no cleanup needed.
- Audit log grows append-only; archive/rotate to cold storage annually if large.
- Rebuild indexes after large migrations; keep `autoIndex` off in production.

## Rotating secrets

Update the value in Render/Vercel → redeploy. Rotating `JWT_SECRET` invalidates active
sessions (users re-login). Rotate DB user password in Atlas, then update `MONGODB_URI`.

## Common maintenance issues

See [troubleshooting.md](troubleshooting.md) for boot failures, CORS, rate limits, upload
behaviour, and PWA/service-worker refresh.

## Release process

1. Update `docs/RELEASE_NOTES.md` + `docs/VERSION_HISTORY.md`.
2. Merge to `main`; ensure CI is green.
3. Tag `vX.Y.Z`; Render/Vercel deploy.
4. Run the UAT checklist ([uat-m13.md](../architecture/uat-m13.md)) against production.
