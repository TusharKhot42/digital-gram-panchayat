# Monitoring Architecture

All monitoring is **provider-agnostic** — the app depends on small in-house abstractions, not
on any paid SDK. Real providers plug in behind these seams later without touching business code.

## Building blocks

| Concern         | Abstraction                                                    | Prod integration seam                                    |
| --------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| Error reporting | `utils/error-reporter.js` (`reportError` + `setErrorReporter`) | Call `setErrorReporter(sentry.captureException)` at boot |
| Metrics         | `utils/metrics.js` (counters + duration histogram)             | Scrape `GET /api/v1/health/metrics` (Prometheus text)    |
| Request timing  | `middlewares/request-timing.middleware.js`                     | Feeds metrics + `X-Response-Time` + slow-request logs    |
| Logging         | `utils/logger.js` (structured JSON in production)              | Ship stdout to Loki/CloudWatch/Datadog                   |

## Metrics exposed (`/api/v1/health/metrics`)

```
dgp_http_requests_total <n>
dgp_http_responses_2xx_total <n>   # ...3xx/4xx/5xx
dgp_http_request_duration_ms_bucket{le="..."} <n>
dgp_http_request_duration_ms_sum <n>
dgp_http_request_duration_ms_count <n>
```

## Prometheus + Grafana (self-hosted, free)

1. Prometheus `scrape_configs` job targeting the API:
   ```yaml
   - job_name: dgp-api
     metrics_path: /api/v1/health/metrics
     static_configs: [{ targets: ['<api-host>:443'] }]
     scheme: https
   ```
2. Grafana → add Prometheus data source → dashboard panels for request rate, error ratio
   (`5xx / total`), and p95 latency (from the histogram).

## Sentry (when ready)

```js
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN });
setErrorReporter((err, ctx) => Sentry.captureException(err, { extra: ctx }));
```

No other code changes — every unhandled error already flows through `reportError`.

## Health probes

- `/api/v1/health` — human snapshot (uptime, env, version, db state).
- `/api/v1/health/live` — liveness (restart signal).
- `/api/v1/health/ready` — readiness (traffic gate; 503 until DB connected).

## Alerting suggestions

- 5xx ratio > 2% for 5 min.
- p95 latency > 1s (matches the app's slow-request warn threshold).
- Readiness failing / repeated restarts.
- MongoDB connections or disk nearing limits (Atlas alerts).
