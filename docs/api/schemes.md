# Government Schemes API (Milestone 5)

Base: `/api/v1`. Envelope `{ success, data }` / `{ success, error }`. JWT required for `/admin/*`;
`/schemes*` is **public** (no token).

## Public (citizen)

### GET /schemes

Published, active, unexpired schemes. Query: `q` (title/summary/description/id), `category`,
`page`, `limit`, `sortBy` (createdAt|title|category), `sortDir` (asc|desc).
`200` → `{ data: Scheme[], total, page, limit }`.

### GET /schemes/:id

A single published/active/unexpired scheme. `404` if draft, unpublished, deleted, or expired.

## Officer (admin portal) — role **officer**

### GET /admin/schemes · GET /admin/schemes/:id

All active schemes (published + drafts); single active scheme. Same query params as public list.

### POST /admin/schemes

Create. `multipart/form-data`.

| Field                    | Type     | Notes                                                                               |
| ------------------------ | -------- | ----------------------------------------------------------------------------------- |
| title                    | string   | required, 3–160                                                                     |
| description              | string   | required, 5–10000                                                                   |
| summary                  | string   | optional, ≤300                                                                      |
| category                 | string   | Agriculture/Health/Education/Housing/Employment/Women/SeniorCitizen/Financial/Other |
| eligibility              | string   | optional                                                                            |
| requiredDocuments        | string   | optional; newline/comma separated → stored as string[]                              |
| benefits                 | string   | optional                                                                            |
| applicationProcess       | string   | optional                                                                            |
| officialWebsite          | string   | optional, must be a valid URL                                                       |
| publishDate / expiryDate | ISO date | optional                                                                            |
| isPublished              | boolean  | optional                                                                            |
| image                    | file     | optional single image, ≤5MB                                                         |

`201` → the scheme (`schemeId` like `SCH-2026-000001`).

### PUT /admin/schemes/:id

Edit (all fields optional; a new `image` replaces the old one).

### PATCH /admin/schemes/:id/publish · /unpublish

Toggle `isPublished` (publish stamps `publishDate` if unset).

### DELETE /admin/schemes/:id

**Soft delete** — sets `isActive: false`; the document is retained.

## Notes

- Every create / update / publish / unpublish / delete writes an `auditlogs` entry.
- Image uses the shared upload abstraction (Cloudinary; mock URL when unconfigured).
- Search is a case-insensitive regex over id/title/summary/description; a `title+summary+description`
  text index is also present for future `$text` use.
