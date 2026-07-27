# Scaling & production readiness

Target: ~5,000 concurrent citizens with low latency. This note separates **what the code now
does** from **what the deployment must provide** — because past a point, throughput is an
infrastructure decision, not a code one. Be honest with stakeholders about that line.

## What the application already does (in code)

- **Stateless auth** — JWT, no server-side session. Any instance can serve any request, so the
  app scales horizontally with zero stickiness.
- **Bounded connection pool** — `DB_MAX_POOL_SIZE` (default 50) / `DB_MIN_POOL_SIZE`, plus
  `serverSelectionTimeoutMS` / `socketTimeoutMS`, so a burst reuses sockets and fails fast
  instead of hanging (`config/db.js`).
- **Clamped pagination** — every list service runs through `parsePagination`, which caps
  `limit` at `PAGINATION_DEFAULTS.maxLimit` (100). No client can pull an unbounded result set
  (previously `?limit=9999999` on the un-validated `/mine` routes would load a whole
  collection into memory and stall the event loop).
- **Compound indexes for the hot queries** — filter-then-sort patterns are indexed so they use
  an index scan, not a collection scan + in-memory sort:
  - complaints / certificates: `{ citizenId, createdAt }`, `{ status, createdAt }`
  - notifications: `{ recipientId, createdAt }` (feed), `{ recipientId, readAt }` (unread)
  - tax: `{ citizenId, createdAt }`
  - notices / schemes: `{ isPublished, isActive, createdAt }`
  - events: `{ isActive, startDate }`
- **Deliberate index builds** — `DB_AUTO_INDEX=false` in production skips implicit builds on
  boot; run `npm run db:indexes` (idempotent `syncIndexes`) in a maintenance window instead.
- **Response compression**, `helmet`, per-account + per-IP rate limiting, `trust proxy`, 1 MB
  JSON cap, graceful shutdown draining in-flight requests.
- **Read caching on the client** — TanStack Query `staleTime` on reference data (notices,
  schemes, tax, profile) cuts repeat fetches; the citizen PWA also serves them offline.

## What the deployment MUST provide (not in code)

These are required to actually hold 5,000 concurrent with no delay. The code is ready for them
but cannot substitute for them:

1. **Run many instances behind a load balancer.** One Node process uses one core (12 are
   available here). Use a process manager (`pm2 -i max`) or container replicas (K8s/ECS) and a
   load balancer. The app is stateless, so this is purely an ops config.
2. **Managed MongoDB with a replica set** (e.g. Atlas), sized for the working set, with reads
   optionally served from secondaries. A single unmanaged mongod is the first thing to fall
   over under load.
3. **Shared rate-limit / counter store (Redis).** `express-rate-limit` currently uses an
   in-memory store — limits are per-instance and reset on restart. With multiple instances you
   need a Redis (or Mongo) store so limits are global. This is the main correctness gap for a
   multi-instance deployment.
4. **CDN + real object storage for media.** Configure Cloudinary (already integrated) or an
   S3/CDN so images/PDFs are not served by the API process. The mock disk store is dev-only.
5. **Offload CPU-bound work.** PDF + QR generation on certificate approval runs on the request
   thread. It's officer-only and low-frequency today, but at scale move it to a worker/queue
   (BullMQ) so it never blocks the event loop for citizen traffic. Same applies to bcrypt
   during login bursts (already async via bcryptjs, but CPU-bound).
6. **Load test before launch.** k6/Artillery against a staging replica at the real concurrency,
   watching p95 latency, event-loop lag, pool saturation, and Mongo slow queries.

## Environment knobs added

| Var                              | Default | Purpose                                       |
| -------------------------------- | ------- | --------------------------------------------- |
| `DB_MAX_POOL_SIZE`               | 50      | Max DB sockets per instance                   |
| `DB_MIN_POOL_SIZE`               | 5       | Warm connections                              |
| `DB_SERVER_SELECTION_TIMEOUT_MS` | 8000    | Fail fast if no primary                       |
| `DB_SOCKET_TIMEOUT_MS`           | 45000   | Kill stuck sockets                            |
| `DB_AUTO_INDEX`                  | true    | Set `false` in prod; run `npm run db:indexes` |

## Bottom line

The code is now horizontally scalable and free of the obvious per-request footguns (unbounded
queries, missing indexes, unbounded pools). Reaching 5,000 concurrent with headroom is then a
matter of **running enough instances against a properly sized, managed datastore with a shared
rate-limit store** — steps 1–3 above are the ones that actually move the ceiling.
