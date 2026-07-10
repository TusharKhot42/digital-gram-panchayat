# Certificate (Dakhala) API (Milestone 7)

Base: `/api/v1`. Envelope `{ success, data }` / `{ success, error }`. JWT required.

## Citizen

### POST /dakhala

Apply. `multipart/form-data`. Role: **citizen**.

| Field           | Type        | Notes                                                              |
| --------------- | ----------- | ------------------------------------------------------------------ |
| certificateType | string      | Residence / Income / Birth / Death / Character / Other             |
| applicationData | JSON string | type-specific fields (see below); required keys validated per type |
| documents       | file[]      | optional, ≤5, PDF or image, ≤5MB each                              |

`201` → the application (`applicationId` like `DKH-2026-000001`, `status: "Submitted"`).
`400` if a required per-type field is missing.

### GET /dakhala/mine

Own applications, paginated. Query: `status`, `page`, `limit`.

### GET /dakhala/:id

Single application. Role: **citizen (owner)** or **officer**. `403` for another citizen's.

### GET /dakhala/:id/certificate

Access-controlled certificate URL. Owner or officer, and only when **Approved**.
`200` → `{ applicationId, pdfUrl }`; `403` if not owner/officer; `404` if not approved yet.

## Officer — role **officer**

### GET /admin/dakhala

List with filter + pagination. Query: `q` (applicationId), `status`, `certificateType`, `page`, `limit`.

### GET /admin/dakhala/:id

Single application (any).

### PATCH /admin/dakhala/:id/review

Move `Submitted` → `UnderReview` (idempotent otherwise).

### PATCH /admin/dakhala/:id/approve

Generate the PDF certificate, store it, set `Approved` + `pdfUrl`, notify the citizen, audit.
Idempotent if already Approved; `409` if already Rejected.

### PATCH /admin/dakhala/:id/reject

Body: `{ reason }` (**required**, ≥3 chars → `400` otherwise). Sets `Rejected` + `rejectionReason`,
notifies the citizen, audits. `409` if already Approved.

### DELETE /admin/dakhala/:id

**Internal soft delete** (`isActive: false`). Never exposed to citizens.

## Per-type required fields (`applicationData`)

- **Residence**: fullName, address, yearsOfResidence, purpose
- **Income**: fullName, annualIncome, occupation, purpose
- **Birth**: childName, dateOfBirth, placeOfBirth, fatherName, motherName
- **Death**: deceasedName, dateOfDeath, placeOfDeath, relationToApplicant
- **Character**: fullName, purpose
- **Other**: fullName, details, purpose

Single source: `CERT_TYPE_FIELDS` in `@dgp/shared` — the citizen form renders from it and the
backend validates against it.

## PDF generation

Isolated in `certificate/pdf.service.js` (PDFKit) → returns a Buffer, uploaded via the shared upload
abstraction. Template: government header, Gram Panchayat name, certificate number, QR / signature /
official-seal placeholders, applicant + officer details, issue date. A Devanagari TTF dropped at
`backend/assets/fonts/` is auto-registered to enable Marathi rendering (English until then).

## Notes

- Every apply / review / approve / reject / delete writes an `auditlogs` entry.
- Approve + reject call the notification service (`dakhalaUpdate`, mock SMS in M1–M7).
- Documents + generated PDF use Cloudinary (mock URL when unconfigured).
