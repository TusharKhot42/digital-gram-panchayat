# Troubleshooting

| Symptom                                                        | Cause                                | Fix                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Backend exits at boot with "Invalid environment configuration" | Missing/invalid env var              | Set `MONGODB_URI` and a ≥32-char `JWT_SECRET`; see [environment.md](environment.md)                 |
| `MongooseServerSelectionError`                                 | Mongo not running / bad URI          | Start `mongod` or fix `MONGODB_URI`; check network/Atlas IP allowlist                               |
| Officer login fails (401)                                      | No officer seeded                    | `npm run seed:admin -w backend` with `SEED_ADMIN_EMAIL/PASSWORD`                                    |
| Citizen requests 403 `CORS_FORBIDDEN`                          | Origin not allowlisted               | Set `CORS_ORIGIN_CITIZEN/ADMIN` to the exact frontend origins                                       |
| 429 responses during testing                                   | Rate limiter                         | Limits are skipped when `NODE_ENV=test`; in dev, wait for the window or raise limits                |
| Uploads return `mock.cloudinary.local` URLs                    | Cloudinary not configured            | Expected in dev; set Cloudinary creds for real uploads                                              |
| `npm install` inside a package errors                          | Workspaces                           | Always `npm install` from the repo root                                                             |
| Frontend can't reach API                                       | Wrong base URL                       | Set `VITE_API_BASE_URL` in the app's `.env.local`                                                   |
| PWA not installable / SW stale                                 | Non-HTTPS or cached shell            | Serve over HTTPS; hard-reload; the "update available" toast reloads to the new SW                   |
| Offline complaint not sent                                     | Still offline / queue pending        | It syncs automatically on reconnect (background sync); check the toast                              |
| Playwright `--list` works but tests fail                       | Stack not running / browsers missing | Start `npm run dev` + Mongo; run `npx playwright install` for browsers                              |
| Coverage below target                                          | New code untested                    | `npm run test:coverage -w backend`; add tests for uncovered services/routes                         |
| Lint fails on test files                                       | Wrong globals                        | Test globals are configured per glob in `eslint.config.js`; keep test files under the matched paths |

## Useful checks

```bash
curl http://localhost:5000/api/v1/health
npm run lint
npm run test:coverage -w backend
npm run build
```
