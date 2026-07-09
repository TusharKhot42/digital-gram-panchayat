# Notice API (Milestone 4)

Base: `/api/v1`. Envelope `{ success, data }` / `{ success, error }`. JWT required for `/admin/*`;
`/notices*` is **public** (no token).

## Public (citizen)

### GET /notices

Published, active, unexpired notices — reverse chronological. Query: `q` (title/summary/content/id),
`category`, `page`, `limit`. `200` → `{ data: Notice[], total, page, limit }`.

### GET /notices/:id

A single published/active/unexpired notice. `404` if it is a draft, archived, deleted, or expired.

## Officer (admin portal) — role **officer**

### GET /admin/notices

All active notices (published + drafts). Query: `q`, `category`, `page`, `limit`.

### GET /admin/notices/:id

Single active notice (any state).

### POST /admin/notices

Create. `multipart/form-data`.

| Field       | Type     | Notes                                                                              |
| ----------- | -------- | ---------------------------------------------------------------------------------- |
| title       | string   | required, 3–160                                                                    |
| content     | string   | required, 5–10000                                                                  |
| summary     | string   | optional, ≤160 (used for SMS)                                                      |
| category    | string   | General/WaterSupply/Electricity/Health/Event/Emergency/Tax/Other (default General) |
| publishDate | ISO date | optional                                                                           |
| expiryDate  | ISO date | optional                                                                           |
| isPublished | boolean  | optional (create as published)                                                     |
| attachment  | file     | optional single PDF or image, ≤5MB                                                 |

`201` → the notice (`noticeId` like `NTC-2026-000001`).

### PUT /admin/notices/:id

Edit (same fields, all optional; new `attachment` replaces the old one).

### PATCH /admin/notices/:id/publish · /archive

Toggle `isPublished` (publish also stamps `publishDate` if unset).

### DELETE /admin/notices/:id

**Soft delete** — sets `isActive: false`; the document is retained.

### POST /admin/notices/:id/broadcast

Body: `{ sms?: boolean, voice?: boolean, summary: string }`. At least one channel and a summary
(≤160) are required (`400` otherwise). Dispatches to every active citizen with a mobile through the
notification service, records one `notifications` log per recipient per channel, stamps the notice's
`broadcast` metadata, and writes an audit log. `200` → `{ notice, recipientCount, sms, voice }`.

## Notes

- Every create / update / publish / archive / delete / broadcast writes an `auditlogs` entry.
- Attachments use the shared upload abstraction (Cloudinary `auto` for PDF/image; mock URL when
  Cloudinary is unconfigured).
- Notification provider is a mock in M1–M4 (logs + stores `notifications`); the real Twilio/MSG91
  provider and scale/retry hardening land in Milestone 9.
