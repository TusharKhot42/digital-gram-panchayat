# Installation Guide

## Prerequisites

- **Node.js ≥ 20** (`.nvmrc` pins 20) and **npm ≥ 10**
- **MongoDB** — local `mongod` on `27017`, or a MongoDB Atlas connection string
- **Git**
- (Optional) **Cloudinary** account for real media uploads — without it, uploads return
  deterministic mock URLs, so the app runs fully offline for development.

## Steps

```bash
git clone <repo-url>
cd "Digital Gram Panchayat"
npm install            # installs ALL workspaces from the root — never npm install inside a package
```

Create the backend env file (`backend/.env`):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/digital_gram_panchayat
JWT_SECRET=replace-with-a-32-char-minimum-random-secret
CORS_ORIGIN_CITIZEN=http://localhost:5173
CORS_ORIGIN_ADMIN=http://localhost:5174
SMS_PROVIDER=mock
```

Optional frontend env (`frontend/citizen-pwa/.env.local`, `frontend/admin-portal/.env.local`):

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Seed an officer account:

```bash
# PowerShell
$env:SEED_ADMIN_EMAIL="admin@dgp.local"; $env:SEED_ADMIN_PASSWORD="Admin@123"; npm run seed:admin -w backend
```

Run everything:

```bash
npm run dev            # backend :5000 + citizen :5173 + admin :5174
```

## Verify

```bash
curl http://localhost:5000/api/v1/health   # -> { "success": true, ... }
npm run lint
npm test
npm run build
```

See [troubleshooting.md](troubleshooting.md) if any step fails.
