# Technology Stack

## Backend

- **Runtime:** Node.js 20, ES Modules (no build step)
- **Framework:** Express 4
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (HS256), bcryptjs
- **Validation:** express-validator (requests), Zod (env + shared schemas)
- **Uploads:** Multer (memory) + Cloudinary (mock-URL fallback)
- **PDF:** PDFKit
- **Security:** Helmet, CORS allowlist, express-rate-limit, express-mongo-sanitize, compression
- **Logging/monitoring:** Morgan, custom logger, request-timing middleware, provider-agnostic error reporter
- **Testing:** Jest + Supertest + mongodb-memory-server

## Frontend (both apps)

- **UI:** React 18 + Vite 6, Tailwind CSS
- **Routing:** React Router (lazy routes + Suspense)
- **Data:** TanStack Query, Axios
- **Forms:** React Hook Form
- **i18n:** i18next / react-i18next (English + Marathi)
- **Feedback:** react-hot-toast
- **Testing:** Vitest + React Testing Library + jsdom

## Citizen PWA extras

- vite-plugin-pwa (Workbox), IndexedDB offline queue, Framer Motion, Leaflet maps

## Admin portal extras

- Recharts (lazy-loaded dashboard charts)

## Shared

- `@dgp/shared` — Zod schemas, enums, constants, utilities consumed by backend + both frontends

## Tooling

- npm workspaces monorepo, ESLint (flat config) + Prettier, Husky + lint-staged, Playwright (E2E)
