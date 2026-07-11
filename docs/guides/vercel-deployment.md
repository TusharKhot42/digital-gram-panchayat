# Vercel Deployment Guide (Citizen PWA + Admin Portal)

Both frontends are static Vite builds deployed as **two separate Vercel projects** from the
same monorepo. Each has a `vercel.json` with SPA rewrites and cache headers.

## Create two projects

For **each** app (citizen-pwa, admin-portal):

1. Vercel → **Add New → Project** → import the GitHub repo.
2. **Root Directory:** `frontend/citizen-pwa` (or `frontend/admin-portal`).
3. Framework preset: **Vite** (auto-detected).
4. Build settings (from `vercel.json`, usually auto):
   - Install Command: `npm ci`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Environment variable:
   - `VITE_API_BASE_URL = https://<api>.onrender.com/api/v1`
6. Deploy.

> Vercel runs the install from the repo root when a workspace root is detected, so
> `@dgp/shared` resolves correctly. If not, set the root install to `npm ci` at the repo root.

## SPA + caching (already in `vercel.json`)

- Rewrite everything to `/index.html` (client-side routing).
- `assets/*` → `immutable, max-age=1y` (content-hashed).
- Citizen PWA: `sw.js` → `no-store`; `manifest.webmanifest` → `max-age=1h` so the service
  worker updates promptly.

## After both are live

1. Copy the two Vercel URLs.
2. In Render, set `CORS_ORIGIN_CITIZEN` / `CORS_ORIGIN_ADMIN` to those HTTPS origins and
   redeploy the API (the allowlist rejects unknown origins).
3. Verify:
   - Citizen: register → file complaint → install prompt → offline read.
   - Admin: officer login → dashboard → approve a certificate.

## PWA specifics

- HTTPS is automatic on Vercel — required for the service worker + install prompt.
- The "update available" toast reloads to the newest service worker.
- Custom domain: add it in Vercel, then update the API CORS origins to match.
