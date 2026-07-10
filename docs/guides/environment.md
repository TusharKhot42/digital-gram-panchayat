# Environment Variables

Backend env is validated by Zod at boot (`backend/src/config/env.js`) — the process exits
with a clear message if a required var is missing or invalid.

## Backend (`backend/.env`)

| Variable                                              | Required | Default                 | Notes                                   |
| ----------------------------------------------------- | -------- | ----------------------- | --------------------------------------- |
| `NODE_ENV`                                            | no       | `development`           | `development` \| `test` \| `production` |
| `PORT`                                                | no       | `5000`                  | API port                                |
| `API_VERSION`                                         | no       | `v1`                    | Mount prefix `/api/{version}`           |
| `MONGODB_URI`                                         | **yes**  | —                       | Mongo connection string                 |
| `JWT_SECRET`                                          | **yes**  | —                       | ≥ 32 chars                              |
| `JWT_EXPIRY_CITIZEN`                                  | no       | `24h`                   | Citizen token TTL                       |
| `JWT_EXPIRY_OFFICER`                                  | no       | `8h`                    | Officer token TTL                       |
| `CORS_ORIGIN_CITIZEN`                                 | no       | `http://localhost:5173` | Allowlisted origin                      |
| `CORS_ORIGIN_ADMIN`                                   | no       | `http://localhost:5174` | Allowlisted origin                      |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET`  | no       | —                       | Real uploads; omit for mock URLs        |
| `SMS_PROVIDER`                                        | no       | `mock`                  | `mock` \| `twilio` \| `msg91`           |
| `TWILIO_ACCOUNT_SID` / `_AUTH_TOKEN` / `_FROM_NUMBER` | no       | —                       | When `SMS_PROVIDER=twilio`              |
| `MSG91_API_KEY` / `_SENDER_ID`                        | no       | —                       | When `SMS_PROVIDER=msg91`               |
| `EMAIL_PROVIDER`                                      | no       | —                       | Enables email channel when set          |
| `RATE_LIMIT_WINDOW_MS`                                | no       | `900000`                | General limiter window                  |
| `RATE_LIMIT_MAX`                                      | no       | `100`                   | General limiter ceiling                 |
| `LOG_LEVEL`                                           | no       | `info`                  | `fatal…trace`                           |

## Frontend (`.env.local` in each app)

| Variable            | Default                        | Notes              |
| ------------------- | ------------------------------ | ------------------ |
| `VITE_API_BASE_URL` | `http://localhost:5000/api/v1` | API base for Axios |

## E2E (optional overrides)

| Variable                                 | Default                         |
| ---------------------------------------- | ------------------------------- |
| `E2E_CITIZEN_URL`                        | `http://localhost:5173`         |
| `E2E_ADMIN_URL`                          | `http://localhost:5174`         |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | `admin@dgp.local` / `Admin@123` |

All `.env*` files are gitignored.
