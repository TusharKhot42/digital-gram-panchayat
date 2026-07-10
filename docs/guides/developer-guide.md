# Developer Guide

## Getting started

See [installation.md](installation.md). Run `npm run dev` for all three apps.

## Conventions

- **Language:** plain JavaScript everywhere — ES Modules (backend), JSX (frontends). No TypeScript.
- **Feature folders:** add a domain under `backend/src/features/<name>/` with
  `*.routes.js`, `*.controller.js`, `*.service.js`, `*.model.js`, `*.validation.js`.
  Controllers stay thin (parse req → call service → send envelope); logic lives in services.
- **Shared contract:** put schemas/enums/constants/utils shared by client + server in
  `frontend/shared/src` (`@dgp/shared`) — never duplicate a shape.
- **Responses:** always use `successResponse` / `errorResponse` (uniform envelope). Throw
  `AppError(status, code, message, fields?)`; the error middleware renders it.
- **Async routes:** wrap handlers in `asyncHandler`.
- **Audit:** every mutation calls `writeAudit(...)`.
- **i18n:** no hardcoded UI strings — add keys to both `en` and `mr` locale files (parity is
  checked). Access via `t('...')`.
- **Accessibility:** semantic elements, `aria-label` on icon-only controls, `role="alert"`
  on error states, focus-visible rings.

## Commands

| Command                            | Purpose                                   |
| ---------------------------------- | ----------------------------------------- |
| `npm run dev`                      | backend + both frontends                  |
| `npm run lint` / `lint:fix`        | ESLint (flat config) monorepo-wide        |
| `npm test`                         | all workspace tests (Jest + Vitest)       |
| `npm run test:coverage -w backend` | backend coverage                          |
| `npm run build`                    | build both frontends                      |
| `npm run e2e`                      | Playwright journeys (needs running stack) |
| `npm run format` / `format:check`  | Prettier                                  |

## Testing

- **Backend:** Jest + Supertest + mongodb-memory-server in `backend/tests/{unit,integration}`.
  Each integration file spins its own in-memory Mongo. Aim to cover new services + routes.
- **Frontend:** Vitest + React Testing Library in `frontend/*/src/test`. Test components,
  hooks, contexts, error boundaries.
- **E2E:** Playwright specs in `e2e/` describe full journeys; run against a live stack.

## Git workflow

Branch `feature/<name>` off `main`. Conventional commits
(`feat|fix|chore|test|docs|refactor|style|perf|build|ci: …`) — enforced by a commit-msg hook.
`lint-staged` runs ESLint + Prettier on staged files. CI must be green (lint + test + build).

## Adding an endpoint (checklist)

1. Shared schema/enum in `@dgp/shared` (if the shape is shared).
2. `validation` rules → `service` logic (+ `writeAudit`) → `controller` → `routes`.
3. Mount the router in `app.js` if new.
4. Tests (integration for the route, unit for pure logic).
5. Update `docs/api/openapi.yaml` + Postman collection.
