# Operations Manual

Day-2 operations for running Digital Gram Panchayat in production.

## Topology

- **API:** Render web service (`node backend/src/server.js`), autoscale/instance per plan.
- **Citizen PWA / Admin portal:** Vercel static projects.
- **Database:** MongoDB Atlas. **Media:** Cloudinary.

## Environments

| Env        | API                     | Notes                               |
| ---------- | ----------------------- | ----------------------------------- |
| local      | `npm run dev`           | mock SMS, mock uploads, local Mongo |
| production | Render + Vercel + Atlas | real secrets, structured logs, HSTS |

Config reference: [environment.md](environment.md). Secrets live only in Render/Vercel.

## Routine tasks

### Create an officer account

```bash
SEED_ADMIN_EMAIL=officer@yourgp.gov.in SEED_ADMIN_PASSWORD=<strong> npm run seed:admin -w backend
```

Run from Render Shell or a one-off job. Deactivate leavers via the admin **Users** screen.

### Deploy

- Push to `main` → CI runs (lint/test/coverage/build) → Render + Vercel auto-deploy.
- Roll back via the Render/Vercel dashboard (previous deploy) if a release misbehaves.

### Health & metrics

- Liveness: `GET /api/v1/health/live` · Readiness: `/health/ready` · Metrics: `/health/metrics`.
- Wire Render health check to `/health/ready`. Scrape metrics with Prometheus
  ([monitoring.md](monitoring.md)).

### Logs

Production logs are structured JSON on stdout (level, time, msg, context, error). Ship to your
aggregator. Startup logs `Server started`; shutdown logs `Shutdown initiated`/`complete`; slow
requests (>1s) log at warn.

## Incident response

1. Check `/health/ready` and Render/Vercel status.
2. Inspect logs (error ratio, stack traces) and Atlas metrics (connections, disk).
3. If DB down → readiness 503 holds traffic; restore/failover per
   [backup-recovery.md](backup-recovery.md).
4. If a bad release → roll back the deploy.
5. Communicate, then post-mortem.

## Routine schedule

| Task                             | Cadence                 |
| -------------------------------- | ----------------------- |
| Verify backups restore (staging) | Monthly                 |
| Review audit log for anomalies   | Weekly                  |
| `npm audit` / dependency updates | Monthly                 |
| Rotate secrets                   | Quarterly / on incident |
| Capacity review (Atlas + Render) | Quarterly               |

See also [maintenance.md](maintenance.md).
