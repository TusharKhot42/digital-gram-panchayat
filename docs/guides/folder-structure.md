# Folder Structure

```
Digital Gram Panchayat/
├── backend/
│   ├── src/
│   │   ├── app.js                # Express app assembly (middleware + routers)
│   │   ├── server.js             # Process bootstrap (DB connect + listen)
│   │   ├── config/               # env (Zod), db, cloudinary
│   │   ├── middlewares/          # auth, role, validate, upload, idempotency,
│   │   │                         #   security, rate-limit, request-timing, error, not-found
│   │   ├── features/             # one folder per domain (routes/controller/service/model/validation)
│   │   │   ├── auth/ complaints/ notices/ schemes/ tax/ certificates/
│   │   │   ├── dashboard/ users/ notifications/ (+ providers/) audit/ idempotency/ health/
│   │   └── utils/                # logger, error-reporter, performance, jwt, password, upload, async-handler
│   └── tests/                    # unit/ + integration/ (Jest + Supertest)
├── frontend/
│   ├── citizen-pwa/
│   │   └── src/{pages,layouts,features,components,hooks,store,services,locales,routes,test}
│   ├── admin-portal/
│   │   └── src/{pages,layouts,features,components,hooks,store,services,locales,routes,test}
│   └── shared/src/{schemas,types,constants,utils}   # @dgp/shared
├── e2e/                          # Playwright specs (citizen + admin journeys)
├── docs/
│   ├── api/                      # openapi.yaml, postman_collection.json, per-module API md
│   ├── architecture/             # blueprint, execution-plan, hardening, pwa-offline
│   ├── guides/                   # installation, developer, deployment, database, env, troubleshooting, ...
│   └── uml/                      # uml.md (Mermaid diagrams)
├── scripts/                      # seed-admin, tooling
├── eslint.config.js  playwright.config.js  package.json (workspaces)
```

Each backend feature follows the same layering: `*.routes.js → *.controller.js → *.service.js → *.model.js`, with `*.validation.js` for express-validator rules. Frontend features mirror this with `pages/`, `components/`, `hooks.js`, and a service module per domain.
