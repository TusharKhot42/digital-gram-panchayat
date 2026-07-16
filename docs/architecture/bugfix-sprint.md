# Bug-Fix & Feature-Enhancement Sprint

No architecture/stack/folder changes. All changes additive and backward compatible; no existing
API removed; no tests removed.

## 1. Root-cause analysis

| #               | Issue                                                       | Root cause                                                                                                                                                                                     | Fix                                                                                                                                                                                     |
| --------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1.1            | Complaint had only one image input                          | Single `<input capture="environment">` forces camera and can't pick from gallery                                                                                                               | Two inputs: **Capture Photo** (camera) + **Upload Photo** (gallery); shared validation                                                                                                  |
| P1.2            | GPS unreliable                                              | No typed errors/retry; short timeout; no loading/coords feedback                                                                                                                               | `useGeolocation` maps `PositionError` codes (denied/unavailable/timeout), 15s timeout, retry, live coords + accuracy; submission never blocked                                          |
| P1/P2 notices   | "Notices/attachments/complaint images not visible"          | Backend list is correct (covered by tests); the **mock upload URL** (`mock.cloudinary.local`) pointed nowhere, so every image/PDF/attachment was a broken link when Cloudinary is unconfigured | Mock mode now **stores bytes and serves them** at `/api/v1/uploads/:key`; URLs resolve in both mock and Cloudinary modes                                                                |
| P1.3/P2.3 certs | Too many certificate types                                  | Types hardcoded via shared `CERT_TYPES`                                                                                                                                                        | Reduced to Residence, Birth, Death, 7/12, Other (single source cascades to backend, both portals, i18n)                                                                                 |
| P2.5            | Admin notification centre redundant (one row per recipient) | Broadcast writes one Notification per recipient; admin list showed them all                                                                                                                    | New `broadcastId` groups them; aggregation endpoint returns **one row per broadcast** with delivered/failed counts; drill-in shows recipients. Citizen notifications unchanged          |
| P3              | Content only visible in the authored language               | No stored translations                                                                                                                                                                         | Provider-agnostic translation service + mock provider; store `{ en, mr }` for notices, notifications, complaint remarks, certificate reject reasons; citizen reads by selected language |

## 2. Files modified (by area)

- **Uploads (root cause):** `features/uploads/{upload-store,uploads.routes}.js` (new), `utils/upload.js`, `app.js`, `config/env.js` (`SELF_URL`).
- **Complaint camera/GPS:** citizen `components/PhotoUploader.jsx`, `components/GpsCapture.jsx`, `hooks/useGeolocation.js`, complaint i18n.
- **Certificate types:** shared `constants/index.js` (`CERT_TYPES`, `CERT_TYPE_FIELDS`); i18n (both apps, both langs). Backend model/validation/schema cascade automatically.
- **Tax bills:** tax `model/service/controller/routes`, `middlewares/upload.middleware.js` (`uploadTaxBills`), admin `TaxForm`/`taxService`/`hooks`, citizen `TaxCard`, i18n.
- **Notification rollup:** notification `model/service/controller/routes`; admin `NotificationsList`/`NotificationDetail`/`notificationService`/`hooks`, i18n.
- **Translation:** `features/translation/{translation.service,providers/mock.provider}.js` (new); notice/notification/complaint/certificate services + models; shared `utils/i18n-content.js` (`pickLocale`); citizen notice/notification/complaint/certificate views.

## 3. Database changes (all additive, no migration required)

- `notices.i18n` (Mixed): `{ title, summary, content }` each `{ en, mr }`.
- `notifications.broadcastId` (String, indexed) and `notifications.i18n` (`{ title, message }`).
- `taxrecords.bills` (`[{ url, type, name, uploadedAt }]`).
- `complaints.remarks[].i18n` (`{ en, mr }`).
- `certificateapplications.rejectionReasonI18n` (`{ en, mr }`).

Existing documents without these fields render via fallback to the original plain field.

## 4. API changes (additive only)

- **New:** `GET /api/v1/uploads/:key` (serves mock uploads); `GET /api/v1/admin/notifications/broadcasts`; `GET /api/v1/admin/notifications/broadcasts/:broadcastId`.
- **Extended (backward compatible):** `POST /api/v1/admin/tax` now accepts optional multipart `bills`; responses for notices/notifications/complaints/certificates include the new `i18n`/bills fields. All existing request/response shapes preserved.
- Env: `SELF_URL`, `TRANSLATION_PROVIDER` (defaults keep dev working with no keys).

## 5. Test summary

Backend **177** passing (was 166): added `translation` (unit), `uploads`, and `sprint` (tax bills, notice bilingual, broadcast rollup) suites; updated `utils` upload-URL assertions. Frontend **15** (Vitest) unchanged and green.

## 6. Verification report

| Step                  | Result                  |
| --------------------- | ----------------------- |
| `npm install`         | ✅                      |
| `npm run lint`        | ✅ 0 errors, 0 warnings |
| `npm test` (backend)  | ✅ 177                  |
| `npm test` (frontend) | ✅ citizen 10 + admin 5 |
| `npm run build`       | ✅ both apps            |
| i18n EN/MR parity     | ✅ both apps            |

## Translation provider note

The mock provider ships as the default (no API key needed) and returns the source text with a
`[lang]` marker so the other-language version is present and visibly distinct. A real provider
(Google Translate/OpenAI/…) implements the same `translate(text, from, to)` contract and is
selected via `TRANSLATION_PROVIDER` — no caller changes. Names, IDs, and addresses are never
translated (only titles/messages/remarks/reasons are).
