# Digital Gram Panchayat

Digital citizen-services platform for Grampanchayat Sakharale — complaints, notices, government
schemes, tax records, and certificate (Dakhala) applications — delivered through a bilingual
(English / Marathi) **installable, offline-capable citizen PWA** and an **officer admin portal**,
backed by one Node/Express REST API.

## Features

- **Citizen:** register/login, file & track complaints (with photos + GPS, works offline),
  read notices & government schemes, view tax dues, apply for and download certificates,
  in-app notifications, install-to-home-screen, full offline reading, EN/MR.
- **Officer:** live dashboard, resolve complaints, review/approve/reject certificates (auto
  PDF), manage notices/schemes/tax, broadcast SMS/voice/in-app notifications, user management,
  audit trail.
- **Platform:** JWT auth + role gates, idempotent submissions, rate limiting, Helmet + strict
  CORS, provider-agnostic notifications, append-only audit log, 80%+ backend test coverage.

## Monorepo layout

```
frontend/citizen-pwa/   Citizen installable PWA (React + Vite + Workbox)
frontend/admin-portal/  Officer admin portal (React + Vite + Recharts)
frontend/shared/        @dgp/shared — Zod schemas, enums, constants, utils
backend/                Express REST API (Node.js, ES Modules)
e2e/                    Playwright end-to-end journeys
docs/                   Guides, API specs (OpenAPI/Postman), UML, architecture
```

Stack: **MERN** (MongoDB, Express, React, Node.js), JavaScript throughout — ES Modules on the
backend, JSX on the frontends. No TypeScript. Full list: [docs/guides/tech-stack.md](docs/guides/tech-stack.md).

## Quick start

```bash
git clone <repo-url>
cd "Digital Gram Panchayat"
npm install                         # from the root — installs all workspaces

# backend/.env  (see docs/guides/environment.md)
#   MONGODB_URI=mongodb://127.0.0.1:27017/digital_gram_panchayat
#   JWT_SECRET=<32+ char secret>

$env:SEED_ADMIN_EMAIL="admin@dgp.local"; $env:SEED_ADMIN_PASSWORD="Admin@123"; npm run seed:admin -w backend
npm run dev                         # backend :5000 + citizen :5173 + admin :5174
```

Full steps: [docs/guides/installation.md](docs/guides/installation.md).

## Scripts (from repo root)

| Script                            | Does                                                           |
| --------------------------------- | -------------------------------------------------------------- |
| `npm run dev`                     | Backend + both frontends concurrently                          |
| `npm run build`                   | Build both frontend apps                                       |
| `npm run lint` / `lint:fix`       | ESLint across the monorepo                                     |
| `npm test`                        | Every workspace's tests (Jest + Vitest)                        |
| `npm run test:coverage`           | Backend coverage **and the CI gate** — run this before pushing |
| `npm run e2e`                     | Playwright journeys (needs a running stack)                    |
| `npm run format` / `format:check` | Prettier                                                       |

## Documentation

- **Guides:** [installation](docs/guides/installation.md) ·
  [developer](docs/guides/developer-guide.md) · [deployment](docs/guides/deployment.md) ·
  [architecture](docs/guides/architecture.md) · [database](docs/guides/database.md) ·
  [environment](docs/guides/environment.md) · [folder structure](docs/guides/folder-structure.md) ·
  [tech stack](docs/guides/tech-stack.md) · [troubleshooting](docs/guides/troubleshooting.md)
- **API:** [OpenAPI 3.1](docs/api/openapi.yaml) · [Postman collection](docs/api/postman_collection.json) ·
  per-module notes in [docs/api](docs/api)
- **UML:** [docs/uml/uml.md](docs/uml/uml.md) (use case, class, component, deployment,
  sequence, ER, activity, package)
- **Architecture notes:** [blueprint](docs/architecture/blueprint.md) ·
  [PWA/offline](docs/architecture/pwa-offline.md) ·
  [production hardening](docs/architecture/production-hardening.md)

## Testing

- **Backend:** Jest + Supertest + mongodb-memory-server — 282 tests, 82% statements /
  85% lines.
- **The coverage gate is enforced in CI, not by `npm test`.** `npm test` runs without
  `--coverage`, so a drop below the thresholds in `backend/jest.config.js` (statements 80,
  branches 62, functions 78, lines 84) stays invisible locally and fails the build instead.
  Run `npm run test:coverage` before pushing.
- **Frontend:** Vitest + React Testing Library — components, hooks, contexts, error boundaries.
- **E2E:** Playwright — citizen + officer journeys in `e2e/`.

## Contributing

Branch `feature/<name>` off `main`, conventional commits (enforced by a commit-msg hook),
CI green (lint + test + build). See [developer guide](docs/guides/developer-guide.md).
