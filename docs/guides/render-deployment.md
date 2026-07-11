# Render Deployment Guide (Backend API)

The backend deploys to **Render** as a Node web service. A `render.yaml` blueprint at the repo
root captures the whole config; you can also set it manually.

## Blueprint (recommended)

1. Push the repo to GitHub.
2. Render → **New → Blueprint** → select the repo. Render reads `render.yaml`.
3. Fill the `sync: false` secrets in the dashboard (below), then **Apply**.

## Manual settings (equivalent)

| Setting               | Value                        |
| --------------------- | ---------------------------- |
| Environment           | Node                         |
| Region                | Singapore (closest to India) |
| Branch                | `main`                       |
| **Build Command**     | `npm ci`                     |
| **Start Command**     | `node backend/src/server.js` |
| **Health Check Path** | `/api/v1/health/ready`       |
| Auto-Deploy           | On                           |
| Instance              | Free or Starter              |

Root `npm ci` installs all workspaces, including `@dgp/shared`, which the backend imports.

## Environment variables (set as secrets)

| Key                                         | Value                                |
| ------------------------------------------- | ------------------------------------ |
| `NODE_ENV`                                  | `production`                         |
| `API_VERSION`                               | `v1`                                 |
| `MONGODB_URI`                               | Atlas SRV string (secret)            |
| `JWT_SECRET`                                | ≥ 32-char random (secret)            |
| `JWT_EXPIRY_CITIZEN` / `JWT_EXPIRY_OFFICER` | `24h` / `8h`                         |
| `CORS_ORIGIN_CITIZEN`                       | `https://<citizen>.vercel.app`       |
| `CORS_ORIGIN_ADMIN`                         | `https://<admin>.vercel.app`         |
| `SMS_PROVIDER`                              | `mock` (or `twilio`/`msg91` + creds) |
| `CLOUDINARY_*`                              | for real uploads                     |
| `LOG_LEVEL`                                 | `info`                               |

> The app refuses to boot in production if a CORS origin or `MONGODB_URI` still points at
> localhost — set the real public origins.

## Health checks

- **Readiness** (`/api/v1/health/ready`) returns 503 until MongoDB connects → Render holds
  traffic during cold start / DB blips.
- **Liveness** (`/api/v1/health/live`) is dependency-free → use for restart policies.
- **Metrics** (`/api/v1/health/metrics`) exposes Prometheus text for scraping.

## Post-deploy

```bash
# seed the first officer (Render Shell or one-off job)
SEED_ADMIN_EMAIL=admin@yourgp.gov.in SEED_ADMIN_PASSWORD=<strong> npm run seed:admin -w backend
curl https://<api>.onrender.com/api/v1/health/ready
```

## Notes

- Render sets `PORT`; the app reads it. Do not hard-bind another port.
- Graceful shutdown on `SIGTERM` (Render deploy/restart) drains in-flight requests, closes the
  server, and disconnects Mongo within a 10s cap.
- Free instances sleep on inactivity; the first request after sleep is slow (cold start).
