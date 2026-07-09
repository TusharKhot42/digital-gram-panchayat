# Complaint API (Milestone 3)

Base: `/api/v1`. All responses use the envelope `{ success, data }` or `{ success, error: { code, message, fields? } }`.
JWT `Authorization: Bearer <token>` required except where noted.

## Citizen

### POST /complaints

Create a complaint. `multipart/form-data`. Role: **citizen**.

| Field       | Type   | Notes                                                    |
| ----------- | ------ | -------------------------------------------------------- |
| category    | string | one of Road, WaterSupply, Sanitation, Electricity, Other |
| title       | string | 3–120 chars                                              |
| description | string | 5–2000 chars                                             |
| latitude    | number | optional, -90..90                                        |
| longitude   | number | optional, -180..180                                      |
| accuracy    | number | optional, GPS metres                                     |
| address     | string | optional, ≤300                                           |
| images      | file[] | optional, ≤3, JPG/PNG/WEBP, ≤5MB each                    |

`201` → the created complaint (`complaintId` like `CMP-2026-000001`, `status: "Pending"`, seeded `statusHistory`).
Errors: `400` VALIDATION_ERROR / INVALID_FILE_TYPE / FILE_TOO_LARGE / TOO_MANY_FILES, `401`, `403` (officer).

### GET /complaints/mine

Own complaints, paginated. Role: **citizen**. Query: `page`, `limit`.
`200` → `{ data: Complaint[], total, page, limit }`.

### GET /complaints/:id

Single complaint. Role: **citizen (owner)** or **officer**. `403` if a citizen requests another's. `404` if missing.

## Officer (admin portal)

### GET /admin/complaints

List with search / filter / sort / pagination. Role: **officer**.
Query: `q` (matches complaintId/title/description), `status`, `category`, `ward`, `priority`, `from`, `to`,
`sortBy` (createdAt|status|category|priority), `sortDir` (asc|desc), `page`, `limit`.
`200` → `{ data, total, page, limit }`.

### GET /admin/complaints/:id

Single complaint (any). Role: **officer**.

### PATCH /admin/complaints/:id/status

Update status + optional remark. Role: **officer**.
Body: `{ status: "Pending"|"InProgress"|"Resolved", remark?: string }`.
A remark is **required** when `status = "Resolved"` (`400` otherwise).
Side effects: appends `statusHistory`, appends `remarks` (if remark), writes an audit log
(`complaint.status.update`), and sends the citizen a status SMS (mock in M1–M3, real provider in M4).

## Notes

- Images upload to Cloudinary when configured; otherwise a mock URL is returned so dev/test run
  without an account (env-driven, see `backend/src/config/cloudinary.js`).
- Sequential ids come from an atomic `counters` collection, keyed per year.
- Every create and status change is recorded in `auditlogs` (non-blocking).
