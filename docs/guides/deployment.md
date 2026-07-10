# Deployment Guide

Three deployable artifacts: the **backend API** (Node process) and two **static frontend
builds** (citizen PWA, admin portal). MongoDB and Cloudinary are managed services.

## 1. Backend

```bash
npm ci
# set production env (see environment.md) — MONGODB_URI, JWT_SECRET (≥32 chars),
# CORS_ORIGIN_CITIZEN, CORS_ORIGIN_ADMIN, NODE_ENV=production, SMS/Cloudinary creds
npm run start -w backend          # node src/server.js
```

Notes:

- `NODE_ENV=production` enables HSTS and hides internal error messages.
- Run behind a TLS-terminating reverse proxy (nginx/Cloud LB); `trust proxy` is set to 1.
- Rate limiting uses client IP from `X-Forwarded-For` — ensure the proxy sets it.
- Health check: `GET /api/v1/health`.
- Process manager: PM2/systemd, or a container:
  ```dockerfile
  FROM node:20-alpine
  WORKDIR /app
  COPY . .
  RUN npm ci --omit=dev
  ENV NODE_ENV=production
  CMD ["node", "backend/src/server.js"]
  ```

## 2. Frontends

```bash
npm run build -w frontend/citizen-pwa    # -> frontend/citizen-pwa/dist
npm run build -w frontend/admin-portal   # -> frontend/admin-portal/dist
```

- Build-time `VITE_API_BASE_URL` must point at the production API.
- Serve each `dist/` as static files (Netlify/Vercel/S3+CloudFront/nginx) with SPA fallback
  to `index.html`.
- Citizen PWA: serve over HTTPS so the service worker + install prompt work; do **not**
  long-cache `index.html` or `sw.js` (Workbox manages versioning).

## 3. Post-deploy

```bash
# seed the first officer
SEED_ADMIN_EMAIL=admin@yourgp.gov.in SEED_ADMIN_PASSWORD=<strong> npm run seed:admin -w backend
```

Smoke test: health endpoint, officer login, citizen register, one complaint, one broadcast.

## CI/CD

Pipeline order: `npm ci → npm run lint → npm test → npm run build`. Optionally gate on
backend coverage and run `npm run e2e` against a preview environment.
