# Digital Gram Panchayat

Digital citizen-services platform for Grampanchayat Sakharale — complaints, notices, government
schemes, tax records, and certificate (Dakhala) applications, served through a bilingual
(English/Marathi) citizen PWA and an officer admin portal, backed by one Node/Express API.

Full plan: [`docs/architecture/blueprint.md`](docs/architecture/blueprint.md) ·
[`docs/architecture/execution-plan.md`](docs/architecture/execution-plan.md)

## Monorepo layout

```
frontend/citizen-pwa/  Citizen-facing installable PWA (React + Vite, JavaScript/JSX)
frontend/admin-portal/ Officer admin portal (React + Vite, JavaScript/JSX)
frontend/shared/       Zod schemas, enums, constants, utils — imported by all three
backend/                Express REST API (Node.js, ES Modules)
docs/                   Architecture, API specs, manuals, ADRs
scripts/                DB seed, backup, icon-gen, env-check tooling
.github/workflows/      CI pipelines
```

Stack: **MERN** (MongoDB, Express, React, Node.js), JavaScript throughout — ES Modules on the
backend, JSX on the frontends. No TypeScript.

See [`docs/architecture/overview.md`](docs/architecture/overview.md) for the full architecture
explanation and [`docs/development-guide.md`](docs/development-guide.md) for conventions.

## Prerequisites

- Node.js >= 20 (`.nvmrc` pins `20`)
- npm >= 10 (ships with Node 20+)
- MongoDB Atlas connection string (or local `mongod`) for the backend
- Git

## Quick start

```bash
git clone <repo-url>
cd digital-gram-panchayat
npm install                 # installs all workspaces from the root — do not npm install inside a package

# copy env templates and fill in real values
cp backend/.env.example backend/.env
cp frontend/citizen-pwa/.env.example frontend/citizen-pwa/.env.local
cp frontend/admin-portal/.env.example frontend/admin-portal/.env.local

npm run dev                 # runs server + citizen-pwa + admin-portal together
```

Individually:

```bash
npm run dev:server          # http://localhost:5000  (health: /api/v1/health)
npm run dev:citizen         # http://localhost:5173
npm run dev:admin           # http://localhost:5174
```

Full setup detail (Atlas cluster, Cloudinary, SMS provider): [`docs/setup-guide.md`](docs/setup-guide.md).
Every environment variable explained: [`docs/environment-guide.md`](docs/environment-guide.md).

## Common scripts (run from repo root)

| Script                                    | Does                                       |
| ----------------------------------------- | ------------------------------------------ |
| `npm run dev`                             | Run backend + both frontends concurrently  |
| `npm run build`                           | Build both frontend apps (Vite)            |
| `npm run lint` / `npm run lint:fix`       | ESLint across the whole monorepo           |
| `npm run test`                            | Run every workspace's test suite           |
| `npm run format` / `npm run format:check` | Prettier write / check across the monorepo |

## Tech stack

Backend: Node.js, Express, JavaScript (ES Modules), MongoDB + Mongoose, JWT, bcryptjs, Multer,
Cloudinary, PDFKit, Helmet, CORS, Morgan, Express Validator (Zod used for env + shared schemas).
Frontend (both): React, JavaScript (JSX), Vite, Tailwind CSS, React Router, Axios, TanStack Query,
React Hook Form, React Hot Toast, i18next. Citizen PWA adds Framer Motion (installable, offline read
land in a later milestone).

## Status

**Milestone 1 — Project Foundation.** Monorepo scaffold, shared contract, health endpoint, app
shells. No business features yet — those land starting Milestone 2 (Authentication). See
[`docs/architecture/execution-plan.md`](docs/architecture/execution-plan.md) for the full roadmap.

## Contributing

Branch off `develop`, one `feature/<name>` branch per milestone/slice, conventional commits
(`feat|fix|chore|test|docs|refactor|style|perf|build|ci: description`) — enforced by a commit-msg
hook. PRs need CI green (lint + build + test) and one reviewer. Full conventions:
[`docs/development-guide.md`](docs/development-guide.md).
