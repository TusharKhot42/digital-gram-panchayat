# Architecture Guide

## Overview

Digital Gram Panchayat is an npm-workspaces monorepo: two React (Vite) frontends, one
Express API, and a shared contract package. See [UML diagrams](../uml/uml.md) for visuals.

```
Citizen PWA ─┐
             ├─ @dgp/shared ─ HTTPS/JSON ─ Express API ─ MongoDB / Cloudinary / SMS
Admin Portal ┘
```

## Principles

- **Single contract:** `@dgp/shared` holds Zod schemas, enums, constants, and utils used by
  the backend and both frontends — one source of truth for validation and shapes.
- **Feature-folder layering:** each backend domain is `routes → controller → service → model`
  with `validation` rules; frontends mirror with `pages/components/hooks/service`.
- **Uniform envelope:** every response is `{ success, data }` or
  `{ success, error: { code, message, fields? } }`.
- **Provider abstraction:** notifications go through a channel-provider interface
  (SMS/voice/email) so vendors swap without touching business code.
- **Backward compatibility:** later milestones (idempotency, rate limits, CORS) are additive
  and header/opt-in — no existing endpoint changed shape.

## Request flow

`trust proxy → Helmet → CORS allowlist → compression → body parsers (1mb) → mongo-sanitize →
request-timing → morgan → /api router (no-store → general rate limit → feature routers →
route-specific limiters → auth → role → validate → upload/idempotency → controller → service
→ model)`, terminating in `notFound` → `errorMiddleware`.

## Cross-cutting concerns

- **Auth:** stateless JWT (HS256); role gate middleware; ownership checks in services.
- **Audit:** `writeAudit` appends to `auditlogs` on every mutation (non-blocking).
- **Idempotency:** `Idempotency-Key` header → stored response replay (24h TTL).
- **Offline (citizen):** Workbox app-shell + runtime caching; IndexedDB queue + background
  sync for complaints.
- **Monitoring:** central logger, request-timing (`X-Response-Time`), provider-agnostic error
  reporter (Sentry-ready, not integrated).

## Security

Helmet, strict CORS allowlist, route-specific rate limiting (429 envelope), Mongo-injection
sanitization, upload MIME allowlist + size caps, `Cache-Control: no-store` on the API,
consistent error responses. Details: [production-hardening.md](../architecture/production-hardening.md).

## Data & scaling notes

Indexes on all query paths; aggregation for dashboards; pagination everywhere; 60s in-memory
dashboard cache in production. The API is stateless, so it scales horizontally behind a load
balancer; MongoDB and Cloudinary are the stateful tiers.
