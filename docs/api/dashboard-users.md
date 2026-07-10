# Dashboard & User Management API (Milestone 8)

Base: `/api/v1`. Envelope `{ success, data }` / `{ success, error }`. All routes **officer-only**.

## Dashboard — `/admin/dashboard`

### GET /admin/dashboard/metrics

Aggregated counts (60s cache in production). `200` → `DashboardMetrics`:
`totalCitizens, totalComplaints, pendingComplaints, resolvedComplaints, totalNotices,
totalSchemes, totalCertificates, approvedCertificates, totalTaxRecords, outstandingTax`.

### GET /admin/dashboard/charts

`200` → `{ complaintsByCategory: [{label,value}], complaintsByStatus: [{label,value}] }`.

### GET /admin/dashboard/activity

`200` → recent audit entries `[{ id, action, entity, actorRole, at }]` (latest 15).

## User management — `/admin/users`

### GET /admin/users

List citizens (default) with search + filter + pagination.
Query: `q` (fullName/mobile/email), `role`, `status` (active|inactive), `page`, `limit`.
`200` → `{ data: User[], total, page, limit }` (never includes `passwordHash`).

### GET /admin/users/:id

`200` → the user profile.

### PATCH /admin/users/:id/status

Body: `{ status: "active" | "inactive" }` → maps to the `isActive` boolean. Audited
(`user.status.update`). **An officer cannot deactivate their own account** (`400
CANNOT_SELF_DEACTIVATE`). A deactivated user's existing token is rejected on the next request
(auth middleware checks `isActive`).

## Aggregation summary

- **metrics** — 9 parallel `countDocuments` + one `$group $sum` over `taxrecords.balance` for
  outstanding dues. All run via `Promise.all` (no N+1); no data duplicated (derived on read).
- **charts** — two `$group` pipelines over `complaints` (by `category`, by `status`), projected to
  `{label,value}`.
- **activity** — indexed `find().sort({at:-1}).limit()` over `auditlogs`.
- 60s in-memory cache on metrics/charts in production; bypassed in dev/test for immediate freshness.

## Citizen dashboard

The citizen Home is personalized by **reusing existing endpoints** (`/complaints/mine`,
`/dakhala/mine`, `/tax/mine`, `/notices`, `/schemes`) via React Query — no new endpoint, no
duplicated aggregation.

## Notes

- Every status change is audited; dashboard activity surfaces the audit trail.
- Admin dashboard + user list auto-refresh (30s) so statistics stay live.
