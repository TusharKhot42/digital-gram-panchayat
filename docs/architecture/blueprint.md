# Digital Gram Panchayat — Software Development Blueprint

Source of truth: SRS + Synopsis (Grampanchayat Sakharale). No code here. Plan only. Detailed enough to start implementation, no further architecture decisions needed.

Style note: terse. Technical substance kept whole. Code/API/field names exact.

---

# 1 Executive Summary

**Vision.** Replace paper Panchayat with one digital platform. Citizen files complaint, reads notice, checks tax, applies certificate from phone. Officer runs all backend from browser. Bilingual English + Marathi.

**Business goals.**
- Kill repeat physical visits to office.
- Faster, transparent complaint + Dakhala flow.
- Notice reach every resident (SMS + voice, works without internet).
- Auditable record every transaction.
- Digital inclusion rural Maharashtra.

**Technical goals.**
- Mobile-first PWA. Installable. Offline read.
- Usable on 2G/3G, minimum 1 Mbps.
- Secure: HTTPS, JWT, bcrypt officer, OTP citizen, audit log.
- Stateless backend, horizontal scale ready.
- Feature-based modular code, maintainable.
- WCAG 2.1 AA where feasible.

**Users.** Three tiers.
- Citizen (primary): 3000-5000 residents. Low-medium tech skill. Marathi first. Intermittent use. Smartphone only.
- Officer (secondary): handful. Daily use. Desktop portal. Basic computer literacy.
- System admin (tertiary): dev/ops. No GUI. Out of scope app-side.

**Scale target.**
- 500 concurrent users.
- SMS broadcast up to 5000 recipients, dispatch under 30s.
- List queries under 1s at 10000 records.
- 99% monthly uptime.
- Single Panchayat phase 1. Multi-tenant deferred.

---

# 2 Software Architecture

## Architecture style
Client-server, layered backend, feature-based modules, REST API, stateless JWT. Three deploy targets: citizen PWA, admin portal, shared backend.

**Why.** Two frontends, one API = no logic duplication. Stateless = scale horizontal on Render, no sticky session. Feature modules = each module ships + tests independent (SRS maintainability + milestone plan).

## Client-server
Two React clients talk one Node/Express REST API over HTTPS. API talks MongoDB Atlas + external services (Cloudinary, Twilio/MSG91, browser Geolocation, map tiles).

## Application layers (backend)
```
Route  ->  Controller  ->  Service  ->  Model(Mongoose)  ->  MongoDB
                 |
             Middleware (auth, role, validate, rateLimit, error, audit)
```
- Route: URL + method + middleware wiring only.
- Controller: parse request, call service, shape response. No business logic.
- Service: business logic, transactions, external calls.
- Model: Mongoose schema, validation, indexes.
- Middleware: cross-cut. auth verify JWT, role gate, zod validate, rate limit, helmet, cors, error handler, audit writer.

**Why layered.** Testable service layer no HTTP mock. Swap Twilio for MSG91 = change one service, controllers untouched.

## Feature-based architecture
Backend + both frontends grouped by domain feature not by file-type. Feature = { auth, complaints, notices, schemes, tax, dakhala, users, dashboard, notifications, audit }. Each owns own routes/controller/service/model (backend) or components/hooks/api/pages (frontend).

**Why.** SRS mandates modular feature dirs. New dev finds all complaint code one folder. Milestone = one feature = one folder.

## Data flow
Citizen action (submit complaint) -> React Hook Form + Zod validate client -> TanStack Query mutation -> Axios POST /api/complaints with JWT header -> Express route -> auth middleware -> role middleware -> zod validate body -> controller -> service (upload photo Cloudinary, geocode, save Mongo, write audit, queue SMS) -> response JSON -> TanStack Query cache update -> UI status.

## Request flow
1. Client attach `Authorization: Bearer <jwt>`.
2. Server helmet + cors first.
3. rateLimit per route.
4. auth middleware verify signature + expiry.
5. role middleware check claim vs route requirement.
6. validate middleware run zod schema on body/params/query.
7. controller -> service -> model.
8. audit middleware/service log mutation.
9. error handler catch, map to HTTP status, log trace, return safe JSON.

## Authentication flow
**Citizen.**
1. POST /api/auth/register {fullName, mobile, address}. Create unverified user. Generate OTP, hash, store Otp doc TTL 5 min, send SMS.
2. POST /api/auth/verify-otp {mobile, otp}. Compare hash, mark user verified, issue JWT 24h.
3. Login: POST /api/auth/login {mobile} -> OTP -> POST /api/auth/verify-otp -> JWT.
4. Client store JWT (memory + guarded persistence). Attach every request.
5. Expiry -> 401 -> client clear -> redirect login.

**Officer.**
1. Account pre-created by admin. No self-register.
2. POST /api/auth/officer/login {username, password}. bcrypt compare. Issue JWT 8h.
3. Inactivity 8h -> expire.

**Role enforcement.** JWT claim `role`. citizen token blocked on every /api/admin/* route by role middleware. Validated server-side each request, never trust client.

## Deployment architecture
```
Vercel (citizen PWA static + service worker)  \
                                               >--HTTPS--> Render (Node/Express) --> MongoDB Atlas
Vercel (admin portal static)                  /                 |
                                                                +--> Cloudinary (files)
                                                                +--> Twilio/MSG91 (SMS/voice)
```
- Frontends: static build, CDN edge, Vercel.
- Backend: Render web service, PM2-style auto-restart (Render handles), env vars.
- DB: MongoDB Atlas managed, daily backup, geo-separate.
- Files: Cloudinary (photos, notice attachments, PDF certs).

**Why split hosting.** Static frontend trivially cached CDN, cheap, fast on 2G. Backend separate = scale independent. Atlas = managed backup + sharding future.

## Module communication
Frontend <-> backend: REST JSON only. No direct DB from client.
Backend internal: service-to-service function call same process (monolith phase 1). Not microservices — overkill single Panchayat. Modular monolith = split later if grow.
Backend <-> external: HTTPS, keys in env.

**Why monolith not microservices.** 500 users, one Panchayat. Microservice ops cost unjustified. Feature modules give clean seams if future split needed.

---

# 3 Folder Structure

Monorepo. npm workspaces. Root manages shared deps + scripts.

```
digital-gram-panchayat/
├── apps/
│   ├── citizen/          # Citizen PWA
│   ├── admin/            # Officer portal
│   └── backend/          # Express API
├── packages/
│   └── shared/           # types, zod schemas, constants shared client+server
├── docs/
├── scripts/
├── .github/workflows/
├── package.json          # workspace root
├── README.md
└── .gitignore
```

**Why monorepo.** shared/ holds zod schemas + TypeScript types used by client validation AND server validation AND API contract. One source, no drift. Single clone, atomic PR across layers.

## apps/citizen (PWA)
```
citizen/
├── public/
│   ├── manifest.webmanifest    # PWA manifest
│   ├── icons/                  # 192,512,maskable
│   └── robots.txt
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/                 # React Router route defs
│   ├── features/               # feature-based
│   │   ├── auth/               # login, register, otp — components,hooks,api
│   │   ├── complaints/
│   │   ├── notices/
│   │   ├── schemes/
│   │   ├── tax/
│   │   ├── dakhala/
│   │   └── profile/
│   ├── components/             # shared UI (shadcn wrappers, cards, buttons)
│   ├── layouts/                # AppShell, BottomNav, header
│   ├── hooks/                  # global hooks (useAuth, useOnline, useGeo)
│   ├── lib/                    # axios instance, queryClient, utils
│   ├── store/                  # context providers (auth,lang,theme)
│   ├── locales/                # en.json, mr.json (i18next)
│   ├── pwa/                    # service worker registration, sync logic
│   └── styles/                 # tailwind entry
├── index.html
├── vite.config.ts              # + PWA plugin
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
- features/: each folder = one module. components/ hooks/ api/ pages/ inside.
- pwa/: service worker + background sync + install prompt.
- locales/: i18next JSON. Add translation, no code change (SRS C-5).
- store/: AuthContext, LanguageContext, ThemeContext.

## apps/admin (portal)
```
admin/
├── src/
│   ├── features/
│   │   ├── auth/               # officer login
│   │   ├── dashboard/          # metrics, charts
│   │   ├── complaints/         # list, detail+map, status update
│   │   ├── notices/            # CRUD + broadcast
│   │   ├── dakhala/            # review, approve, reject, PDF trigger
│   │   ├── tax/                # add/update records, audit view
│   │   ├── schemes/            # CRUD
│   │   ├── users/              # manage citizen accounts
│   │   └── reports/
│   ├── components/             # DataTable, filters, charts, modals
│   ├── layouts/                # Sidebar shell
│   ├── hooks/
│   ├── lib/
│   ├── store/
│   ├── locales/                # en.json (admin English), mr read-only strings
│   └── styles/
├── vite.config.ts
└── package.json
```
No service worker (desktop, online assumed). Sidebar nav not bottom nav.

## apps/backend
```
backend/
├── src/
│   ├── index.ts                # entry, start server
│   ├── app.ts                  # express app, mount middleware+routes
│   ├── config/                 # env loader, db connect, cloudinary, sms client
│   ├── features/
│   │   ├── auth/               # auth.routes .controller .service + otp
│   │   ├── complaints/
│   │   ├── notices/
│   │   ├── schemes/
│   │   ├── tax/
│   │   ├── dakhala/            # + pdf.service (PDFKit)
│   │   ├── users/
│   │   ├── dashboard/
│   │   ├── notifications/      # sms/voice dispatch
│   │   └── audit/
│   ├── models/                 # Mongoose schemas (or per-feature)
│   ├── middleware/             # auth, role, validate, rateLimit, error, upload(multer)
│   ├── lib/                    # jwt, bcrypt, geo, logger, response helpers
│   └── types/
├── tests/                      # jest + supertest
├── .env.example
├── tsconfig.json
└── package.json
```
- config/: single place env + connections.
- middleware/: cross-cut reused all features.
- dakhala/pdf.service: PDFKit certificate generation.
- notifications/: wrap Twilio/MSG91, swappable.

## packages/shared
```
shared/
├── src/
│   ├── schemas/    # zod: complaint, dakhala, user, notice, tax
│   ├── types/      # inferred TS types + enums
│   ├── constants/  # categories, statuses, roles, cert types
│   └── index.ts
└── package.json
```
**Why.** Same zod schema client validate form + server validate body. Same enum both sides. Contract single truth.

## docs
```
docs/
├── architecture/       # diagrams (this blueprint, ERD)
├── api/                # OpenAPI/Postman collection
├── manuals/            # citizen-manual-en, -mr, officer-manual
└── decisions/          # ADRs
```

## scripts
Seed DB, backup, migration, generate icons, env check.

## assets
Icons, logos, sample certificate template — under respective public/ + docs/manuals.

## localization
i18next JSON in each frontend locales/. en.json + mr.json citizen. Admin en primary.

## testing
Backend tests/ (jest+supertest). Frontend __tests__ colocated feature (React Testing Library). e2e/ root (Playwright) optional.

## deployment
`.github/workflows/` CI. vercel.json each frontend. render.yaml backend. `.env.example` each app.

---

# 4 Database Design

MongoDB Atlas. Mongoose ODM. Collections below.

## Collections

### users
One collection, role discriminator.
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | pk |
| role | enum citizen\|officer | required |
| fullName | string | required |
| mobile | string(10) | citizen, unique sparse, indexed |
| username | string | officer, unique sparse |
| passwordHash | string | officer only, bcrypt |
| address | { line, ward, village, pincode } | citizen |
| language | enum en\|mr | default mr |
| status | enum active\|inactive | default active |
| isVerified | bool | OTP done |
| lastLogin | Date | |
| createdAt/updatedAt | Date | timestamps |

Validation: mobile 10 digit regex. role required. officer must have username+passwordHash, citizen must have mobile. Marathi/English name allow Unicode.
Indexes: mobile unique sparse, username unique sparse, role, status.

**Why single collection.** Shared auth logic. role gate simple. Sparse unique = citizen no username collide.

### otps
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| mobile | string | indexed |
| otpHash | string | bcrypt/sha, never plain |
| purpose | enum register\|login | |
| attempts | number | max 5 then invalidate |
| expiresAt | Date | TTL index, 5 min |
| createdAt | Date | |

TTL index on expiresAt auto-delete. Never store plain OTP.

### complaints
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| complaintId | string | human CMP-2026-000123, unique |
| citizenId | ObjectId ref users | required, indexed |
| category | enum Road\|WaterSupply\|Sanitation\|Electricity\|Other | required |
| description | string | required, sanitized |
| photos | [string] | Cloudinary url, max 3 |
| location | GeoJSON Point {type,coordinates[lng,lat]} | optional, 2dsphere |
| accuracy | number | GPS meters |
| ward | string | filter |
| status | enum Pending\|InProgress\|Resolved | default Pending |
| remarks | [{ officerId, note, at }] | internal notes |
| statusHistory | [{ status, by, at }] | audit trail |
| createdAt/updatedAt | Date | |

Indexes: citizenId, status, category, createdAt desc, ward, `location` 2dsphere, complaintId unique.
Validation: category enum, description non-empty, photos max 3.

### notices
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| title | string | required |
| body | string | required |
| attachment | { url, type pdf\|image } | optional |
| publishedBy | ObjectId ref users | officer |
| broadcast | { sms bool, voice bool, summary, dispatchedAt, recipientCount } | |
| isActive | bool | default true (soft delete) |
| createdAt/updatedAt | Date | |

Indexes: createdAt desc, isActive. Public read no auth.

### schemes
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| name | string | required |
| description | string | |
| eligibility | string | |
| benefits | string | |
| procedure | string | |
| officialLink | string url | external portal |
| tags | [string] | search |
| isActive | bool | |
| createdAt/updatedAt | Date | |

Indexes: text index name+description (keyword search), isActive.

### taxrecords
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| type | enum Gharpatti\|PaniPatti | required |
| citizenId | ObjectId ref users | indexed |
| propertyRef | string | property/connection id |
| details | object | property/connection detail |
| assessedAmount | number | annual |
| dues | number | current outstanding |
| payments | [{ amount, at, receivedBy, receiptNo }] | history |
| history | [{ field, old, new, by, at }] | mutation audit (SRS 3.2.4) |
| createdAt/updatedAt | Date | |

Indexes: citizenId, type, propertyRef.
Validation: amounts >=0. history append-only, previous preserved (SRS transparency).

### dakhalaapplications
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| applicationId | string | human DKH-2026-000045, unique |
| citizenId | ObjectId ref users | indexed |
| type | enum Income\|Residence\|Caste\|Birth\|Death\|Other | required |
| formData | object | type-specific fields |
| documents | [string] | Cloudinary url |
| status | enum Submitted\|UnderReview\|Approved\|Rejected | default Submitted |
| rejectionReason | string | required if Rejected |
| certificateUrl | string | Cloudinary PDF, set on Approved |
| reviewedBy | ObjectId ref users | officer |
| statusHistory | [{ status, by, at }] | |
| createdAt/updatedAt | Date | |

Indexes: citizenId, status, type, createdAt desc, applicationId unique.

### notifications
Log every SMS/voice.
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| to | string mobile | |
| channel | enum sms\|voice | |
| purpose | enum otp\|complaintUpdate\|noticeBroadcast\|dakhalaUpdate | |
| body | string | |
| providerMessageId | string | Twilio/MSG91 id |
| status | enum queued\|sent\|failed | |
| error | string | |
| relatedEntity | { kind, id } | |
| at | Date | |

Indexes: to, status, at desc.

### auditlogs
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| actorId | ObjectId | |
| actorRole | enum citizen\|officer\|system | |
| action | string | e.g. complaint.status.update |
| entity | string | collection name |
| entityId | ObjectId | |
| before | object | prior state |
| after | object | new state |
| ip | string | |
| userAgent | string | |
| at | Date | indexed |

Indexes: actorId, entity, at desc. Retention policy configurable.

## Relationships
- users 1—N complaints (citizenId).
- users 1—N dakhalaapplications.
- users 1—N taxrecords.
- users(officer) 1—N notices (publishedBy).
- complaints/dakhala/tax N—1 users.
- auditlogs reference any entity loosely (entity+entityId), no hard ref.
Design: reference not embed for user-owned lists (unbounded growth). Embed sub-arrays only bounded (photos max3, statusHistory small, payments moderate).

**Why reference over embed.** Citizen may have many complaints over years. Embedding in user doc = unbounded doc growth, 16MB cap risk. Separate collection + index = scalable, query by status/category fast.

## Future scalability
- Multi-Panchayat: add `panchayatId` field all collections, compound index. Enables sharding by panchayatId.
- Sharding: MongoDB native, shard key panchayatId (future) or citizenId hashed.
- Officer RBAC: add `permissions[]` to officer user (phase 2).
- Refresh tokens: add tokens collection (phase 2).
- Read scale: Atlas read replicas.

## ER Diagram (text)
```
                         +-----------+
                         |   users   |
                         | role      |
                         +-----+-----+
        citizenId /  publishedBy |  \ citizenId  \ citizenId
                 /               |   \            \
        +-------v----+   +-------v---+ +-----v------+ +---v--------------------+
        | complaints |   |  notices  | | taxrecords | | dakhalaapplications    |
        +-----+------+   +-----------+ +------------+ +------------+-----------+
              | location(GeoJSON)                                  | certificateUrl
              v                                                    v
         [map render]                                        [PDF Cloudinary]

   otps (mobile, TTL)      notifications (to, channel)      auditlogs (actor->entity)
   schemes (standalone, text-indexed)
```

---

# 5 Module Breakdown

Each module: responsibilities, frontend, backend, DB, APIs, components, hooks, utils, validation, security, deps, testing, edge cases.

## 5.1 Auth Module
**Responsibilities.** Citizen register+OTP login, officer password login, JWT issue, session expiry, role gate.
**Frontend (citizen).** Register form, OTP entry, login. `useAuth` hook, AuthContext.
**Frontend (admin).** Officer login form.
**Backend.** auth.routes/controller/service, otp.service, jwt lib, bcrypt lib.
**DB.** users, otps.
**APIs.** /register, /verify-otp, /login, /officer/login, /me, /logout.
**Components.** OtpInput, MobileInput, PasswordInput.
**Hooks.** useAuth, useOtpTimer.
**Utils.** generateOtp, hashOtp, signJwt, verifyJwt.
**Validation.** mobile 10 digit, otp 6 digit, username/password non-empty. zod shared.
**Security.** OTP hashed + TTL + attempt limit. bcrypt cost 10 officer. JWT signed HS256, secret env. Rate limit OTP endpoints (block SMS bomb). No user enumeration (same response valid/invalid mobile).
**Deps.** jsonwebtoken, bcrypt, sms client.
**Testing.** register->otp->verify happy path, wrong otp, expired otp, attempt lockout, officer wrong password, expired token 401.
**Edge cases.** OTP resend cooldown. Concurrent OTP requests. Mobile already registered -> resend login OTP. SMS provider down -> queue + user message. Clock skew token expiry.

## 5.2 Complaint Module
**Responsibilities.** Citizen submit + track. Officer list/detail/status/remark. GPS capture, photo upload.
**Frontend citizen.** ComplaintForm (category, description, photo picker max3, GPS confirm map thumbnail), ComplaintList, ComplaintDetail.
**Frontend admin.** ComplaintTable (search/filter/sort), ComplaintDetail (photos, embedded Leaflet map, status dropdown, remark box, confirm dialog).
**Backend.** complaints feature. photo -> Cloudinary via multer. audit write. SMS on status change.
**DB.** complaints.
**APIs.** POST /complaints, GET /complaints/mine, GET /complaints/:id, GET /admin/complaints, PATCH /admin/complaints/:id/status.
**Components.** CategorySelect, PhotoUploader, GpsConfirm, StatusBadge, MapView.
**Hooks.** useGeolocation, useComplaints, useComplaintMutation.
**Utils.** buildComplaintId, formatStatus.
**Validation.** category enum, description required, photos<=3 image only <=5MB, coordinates valid range.
**Security.** citizen only own complaints (citizenId from token not body). officer route role gated. file type+size validate. sanitize description.
**Deps.** multer, cloudinary, leaflet, geolocation API.
**Testing.** submit with/without GPS, >3 photos reject, oversize reject, status update triggers SMS, citizen cannot read other's complaint.
**Edge cases.** GPS denied -> "Not Available", proceed. Offline submit -> queue background sync. Photo upload fail mid-submit. Duplicate rapid submit.

## 5.3 Notice Module
**Responsibilities.** Officer CRUD + broadcast. Citizen public read.
**Frontend citizen.** NoticeList (reverse chrono), NoticeDetail, attachment view. No auth needed.
**Frontend admin.** NoticeForm (title, body, attachment, broadcast toggles sms/voice + summary), NoticeTable, edit/delete confirm.
**Backend.** notices feature. On broadcast -> notifications dispatch all citizens.
**DB.** notices, notifications.
**APIs.** GET /notices (public), GET /notices/:id (public), POST /admin/notices, PUT /admin/notices/:id, DELETE /admin/notices/:id (soft), POST /admin/notices/:id/broadcast.
**Components.** NoticeCard, AttachmentViewer, BroadcastToggle.
**Hooks.** useNotices, useNoticeMutation.
**Validation.** title+body required, attachment pdf/image <=5MB, summary <=160 chars SMS.
**Security.** read public. write officer only. sanitize body (XSS). soft delete not hard.
**Deps.** cloudinary, sms client.
**Testing.** public read no token, create requires officer, broadcast queues N notifications, delete soft.
**Edge cases.** Broadcast 5000 recipients under 30s -> batch/async queue. Partial SMS failure logged. Voice call fallback.

## 5.4 Schemes Module
**Responsibilities.** Officer CRUD. Citizen browse+search+detail+external link.
**Frontend citizen.** SchemeGrid (cards), SearchBar, SchemeDetail (eligibility, benefits, external link).
**Frontend admin.** SchemeForm, SchemeTable.
**Backend.** schemes feature.
**DB.** schemes.
**APIs.** GET /schemes, GET /schemes/:id, GET /schemes?q=, POST /admin/schemes, PUT /admin/schemes/:id, DELETE /admin/schemes/:id.
**Components.** SchemeCard, SearchBar.
**Hooks.** useSchemes, useSchemeSearch.
**Validation.** name required, officialLink valid url.
**Security.** read public. write officer. link open new tab rel=noopener.
**Testing.** keyword search hits text index, external link render.
**Edge cases.** Empty search state. Broken external link (out of control, warn user leaving).

## 5.5 Tax Module
**Responsibilities.** Citizen view own Gharpatti+PaniPatti. Officer add/update + audit history.
**Frontend citizen.** TaxSummary (property tax + water tax cards), payment history, dues. View-only phase 1.
**Frontend admin.** TaxForm (add record), TaxUpdate (amount, mark paid), AuditHistoryView.
**Backend.** tax feature. Every update append history entry.
**DB.** taxrecords.
**APIs.** GET /tax/mine, GET /admin/tax, POST /admin/tax, PATCH /admin/tax/:id, POST /admin/tax/:id/payment, GET /admin/tax/:id/history.
**Components.** TaxCard, PaymentHistoryTable, AuditTimeline.
**Hooks.** useTaxRecords.
**Validation.** amounts >=0, type enum.
**Security.** citizen own records only. officer full. history immutable append-only.
**Testing.** update creates history entry, previous preserved, citizen sees only own.
**Edge cases.** Record not found for citizen. Negative amount reject. Concurrent officer edit (last-write + history both logged).

## 5.6 Dakhala Module
**Responsibilities.** Citizen apply + track + download PDF. Officer review + approve(generate PDF)/reject(reason).
**Frontend citizen.** CertTypeSelect, DakhalaForm (type-specific fields), DocUploader, ApplicationList, ApplicationDetail, PdfDownload.
**Frontend admin.** DakhalaTable, ApplicationDetail (form data, docs), Approve/Reject confirm dialog (show citizen name + cert type).
**Backend.** dakhala feature + pdf.service (PDFKit). Approve -> generate PDF -> Cloudinary -> SMS. Reject -> reason -> SMS.
**DB.** dakhalaapplications.
**APIs.** POST /dakhala, GET /dakhala/mine, GET /dakhala/:id, GET /dakhala/:id/certificate, GET /admin/dakhala, PATCH /admin/dakhala/:id/approve, PATCH /admin/dakhala/:id/reject.
**Components.** CertTypeCard, DocUploader, StatusBadge, ConfirmDialog, PdfViewer.
**Hooks.** useDakhala, useDakhalaMutation.
**Utils.** buildApplicationId, generateCertificatePdf.
**Validation.** type enum, required form fields per type, docs pdf/image <=5MB, rejectionReason required on reject.
**Security.** citizen own apps only. officer review. PDF url access-controlled (owner or officer). reject reason mandatory.
**Deps.** pdfkit, cloudinary, multer, sms.
**Testing.** apply happy, approve generates PDF + SMS, reject requires reason, citizen download own only, wrong-type field reject.
**Edge cases.** PDF gen fail -> keep status, retry. Cert PDF Marathi font embed (Devanagari). Missing doc. Approve already-approved (idempotent).

## 5.7 User Management Module
**Responsibilities.** Officer view/activate/deactivate citizens.
**Frontend admin.** UserTable (search/filter), UserDetail, activate/deactivate confirm.
**Backend.** users feature.
**DB.** users.
**APIs.** GET /admin/users, GET /admin/users/:id, PATCH /admin/users/:id/status.
**Components.** UserTable, StatusToggle, ConfirmDialog.
**Validation.** status enum.
**Security.** officer only. deactivate confirm (irreversible-ish). deactivated user token rejected next request.
**Testing.** list, deactivate blocks login, confirm dialog present.
**Edge cases.** Deactivate self (block). Deactivate mid-session (invalidate).

## 5.8 Dashboard Module
**Responsibilities.** Officer real-time metrics + charts + activity feed.
**Frontend admin.** MetricCards (total citizens, pending complaints, pending dakhala, active notices), ComplaintCharts (by category, by status), ActivityFeed.
**Backend.** dashboard feature aggregate queries.
**DB.** aggregate across complaints, dakhala, users, notices, auditlogs.
**APIs.** GET /admin/dashboard/metrics, GET /admin/dashboard/charts, GET /admin/dashboard/activity.
**Components.** MetricCard, BarChart, PieChart, ActivityList.
**Hooks.** useDashboard.
**Validation.** none (read).
**Security.** officer only.
**Testing.** counts correct, charts data shape.
**Edge cases.** Empty system (zeros). Large dataset aggregate perf (index + cache 60s).

## 5.9 Notifications Module (internal service)
**Responsibilities.** Send SMS/voice, log, retry. Swappable provider.
**Backend.** notifications feature wraps Twilio/MSG91. Interface `sendSms`, `sendVoice`. Batch broadcast async.
**DB.** notifications.
**Security.** keys env. HTTPS only. no PII in logs beyond mobile.
**Testing.** mock provider, log created, failure captured, batch dispatch.
**Edge cases.** Provider rate limit. Invalid mobile. Broadcast partial fail. Cost guard (confirm before 5000-send).

## 5.10 Audit Module (internal)
**Responsibilities.** Log auth events + mutations.
**Backend.** audit.service write on every mutation (complaint status, tax update, dakhala decision, user status, notice CRUD, login).
**DB.** auditlogs.
**Security.** officer read (reports). immutable. no plain secrets.
**Testing.** mutation writes log with before/after.
**Edge cases.** High write volume (async, non-blocking).

---

# 6 API Planning

Base `/api`. JSON. HTTPS. JWT Bearer. Errors uniform `{ success:false, error:{ code, message } }`. Success `{ success:true, data }`.

## Auth
| Method | URL | Auth | Role | Body | Response | Errors | RateLimit |
|---|---|---|---|---|---|---|---|
| POST | /auth/register | none | - | fullName,mobile,address | 201 {userId} | 400 invalid, 409 exists | 5/hr/ip |
| POST | /auth/login | none | - | mobile | 200 otp sent | 404, 429 | 5/hr/mobile |
| POST | /auth/verify-otp | none | - | mobile,otp | 200 {token,user} | 400 wrong,410 expired,423 locked | 10/hr |
| POST | /auth/officer/login | none | - | username,password | 200 {token} | 401 | 10/hr/ip |
| GET | /auth/me | JWT | any | - | 200 {user} | 401 | - |
| POST | /auth/logout | JWT | any | - | 200 | 401 | - |

## Complaints
| Method | URL | Auth | Role | Notes |
|---|---|---|---|---|
| POST | /complaints | JWT | citizen | multipart photos<=3, GPS optional |
| GET | /complaints/mine | JWT | citizen | own list, paginated |
| GET | /complaints/:id | JWT | citizen(own) | detail |
| GET | /admin/complaints | JWT | officer | filter status/category/date/ward, sort, page |
| PATCH | /admin/complaints/:id/status | JWT | officer | {status,remark} triggers SMS+audit |

## Notices
| POST | /admin/notices | JWT | officer | title,body,attachment |
| PUT | /admin/notices/:id | JWT | officer | edit |
| DELETE | /admin/notices/:id | JWT | officer | soft delete confirm |
| POST | /admin/notices/:id/broadcast | JWT | officer | {sms,voice,summary} async |
| GET | /notices | none | public | reverse chrono, page |
| GET | /notices/:id | none | public | detail |

## Schemes
| GET | /schemes | none | public | list + ?q= search |
| GET | /schemes/:id | none | public | detail |
| POST | /admin/schemes | JWT | officer | create |
| PUT | /admin/schemes/:id | JWT | officer | update |
| DELETE | /admin/schemes/:id | JWT | officer | soft delete |

## Tax
| GET | /tax/mine | JWT | citizen | own Gharpatti+PaniPatti |
| GET | /admin/tax | JWT | officer | list/filter |
| POST | /admin/tax | JWT | officer | add record |
| PATCH | /admin/tax/:id | JWT | officer | update amount, append history |
| POST | /admin/tax/:id/payment | JWT | officer | mark paid |
| GET | /admin/tax/:id/history | JWT | officer | audit history |

## Dakhala
| POST | /dakhala | JWT | citizen | multipart docs |
| GET | /dakhala/mine | JWT | citizen | own list |
| GET | /dakhala/:id | JWT | citizen(own) | detail |
| GET | /dakhala/:id/certificate | JWT | citizen(own)/officer | PDF url |
| GET | /admin/dakhala | JWT | officer | list/filter |
| PATCH | /admin/dakhala/:id/approve | JWT | officer | gen PDF + SMS |
| PATCH | /admin/dakhala/:id/reject | JWT | officer | {reason} required + SMS |

## Users
| GET | /admin/users | JWT | officer | list/search |
| GET | /admin/users/:id | JWT | officer | detail |
| PATCH | /admin/users/:id/status | JWT | officer | activate/deactivate confirm |

## Dashboard
| GET | /admin/dashboard/metrics | JWT | officer | counts |
| GET | /admin/dashboard/charts | JWT | officer | category+status agg |
| GET | /admin/dashboard/activity | JWT | officer | recent feed |

## Reports/Audit
| GET | /admin/reports | JWT | officer | export filters |
| GET | /admin/audit | JWT | officer | audit log query |

**Validation.** All body/param/query zod (shared schemas). Reject 400 uniform.
**Errors.** 400 validation, 401 no/bad token, 403 wrong role, 404, 409 conflict, 410 expired, 423 locked, 429 rate, 500 server (safe message, trace logged).
**Rate limiting.** express-rate-limit. Tight on auth/OTP. Moderate global. Broadcast confirm-gated.
**Pagination.** ?page&limit default 20. List responses `{ data, total, page, limit }`.

---

# 7 UI Planning

## Citizen PWA screens
- **Splash.** Logo, load app shell, check auth+online. Route home or login.
- **Login.** Mobile input, request OTP, OTP entry, verify. Language toggle visible.
- **Register.** Name, mobile, address. OTP verify.
- **Home.** Icon grid: Complaints, Notices, Schemes, Tax, Dakhala, Profile. Bottom nav persistent. Language toggle top.
- **Complaint.** Category select, description, photo picker (max3 thumbnail), GPS confirm map thumbnail, submit.
- **Complaint History.** List own complaints, StatusBadge color-coded, tap detail.
- **Notice.** List reverse chrono, tap detail + attachment. Public.
- **Scheme.** Card grid, search, tap detail + external link.
- **Tax.** Gharpatti + PaniPatti cards, dues, payment history. View only.
- **Certificate (Dakhala).** Type select, form, doc upload, submit. History + PDF download.
- **Profile.** View/edit name+address. Language. Logout.
- **Settings.** Language, theme, help, FAQ, onboarding replay.
- **Offline.** Cached content banner + read-only notices/schemes when no network.
- **404.** Friendly, back home.

**Navigation.** Bottom nav (Home, Complaints, Notices, Dakhala, Profile) one-tap any screen (SRS 3.1.1). Language toggle every screen. Splash->auth gate->Home. Deep links to detail.

## Admin portal screens
- **Login.** Username, password.
- **Dashboard.** Metric cards, charts, activity feed. Landing after login.
- **Users.** Table search/filter, detail, activate/deactivate confirm.
- **Complaints.** Table (search/filter/sort status,category,date,ward), detail with Leaflet map + photos, status update + remark confirm.
- **Certificates (Dakhala).** Table, detail (form+docs), approve/reject confirm dialog (name+type).
- **Taxes.** Table, add/update record, payment, audit history view.
- **Schemes.** Table, add/edit/delete.
- **Notices.** Table, create/edit/delete confirm, broadcast toggle.
- **Reports.** Filters + export.
- **Settings.** Profile, help.

**Navigation.** Persistent left sidebar all modules (SRS 3.1.1). Confirm dialog before irreversible (reject, delete, deactivate). Fully functional >=1024px.

---

# 8 Component Planning

Reusable (shadcn base + wrappers). Shared where possible via components/.

- **Buttons.** Primary, Secondary, Danger, IconButton, LoadingButton (spinner state). 44x44 min touch (SRS).
- **Inputs.** TextInput, TextArea, Select, MobileInput, OtpInput, PasswordInput, SearchBar. Inline validation error below field (React Hook Form + Zod).
- **Cards.** SchemeCard, TaxCard, NoticeCard, MetricCard.
- **Tables.** DataTable (sort/filter/search/paginate) admin. Column config driven.
- **Modals.** ConfirmDialog (irreversible actions), FormModal, ImagePreviewModal.
- **Charts.** BarChart, PieChart (complaints category/status) — recharts.
- **Forms.** ComplaintForm, DakhalaForm, NoticeForm, TaxForm, SchemeForm. RHF + Zod shared schema.
- **Maps.** MapView (Leaflet) — thumbnail citizen, interactive admin detail.
- **Upload.** PhotoUploader (image, max3, preview, size validate), DocUploader (pdf/image).
- **Navigation.** BottomNav (citizen), Sidebar (admin), Header (language toggle, profile).
- **Layouts.** AppShell citizen, DashboardShell admin.
- **Loading states.** Skeleton, Spinner, ButtonLoading.
- **Empty states.** EmptyList (no complaints/notices) with illustration + action.
- **Error states.** ErrorBoundary, ErrorBanner, RetryPrompt, OfflineBanner.
- **StatusBadge.** Color map: Red Pending, Orange InProgress, Green Resolved/Approved, Grey Rejected (SRS 3.1.1).
- **LanguageToggle.** English/Marathi, every screen.

**Why shared components/ + shadcn.** Consistent look, accessible primitives, less code, Tailwind theme central. Shared StatusBadge = one color map, no drift both apps.

---

# 9 State Management

- **React Context.** AuthContext (user, token, login, logout), LanguageContext (i18next lang, toggle), ThemeContext (light/dark). Global, low-frequency change.
- **React Query (TanStack).** All server state: complaints, notices, schemes, tax, dakhala, dashboard. Cache, refetch, optimistic mutation, stale-while-revalidate. Query keys per feature.
- **Local Storage.** Persist auth token (guarded), language pref, theme, onboarding-seen flag. Not sensitive bulk data.
- **Caching.** React Query cache in-memory. Service Worker cache app shell + static + GET notices/schemes (offline read).
- **Offline sync.** IndexedDB queue for complaint submit while offline. Background Sync flush on reconnect. Read cached notices/schemes/tax offline.
- **Auth state.** Context + token. 401 interceptor (Axios) -> clear -> redirect login.
- **Language state.** i18next + Context. Switch no reload (SRS). Persist choice.
- **Theme state.** Context + localStorage.

**Why React Query for server state.** Removes manual loading/error boilerplate, caching, retry, offline-friendly. Context only for cross-cutting client state (auth/lang/theme) — avoid Context for server data (re-render cost).

---

# 10 Security Architecture

- **Authentication.** Citizen OTP (hashed, TTL, attempt-limit). Officer bcrypt password (cost 10). No citizen password stored (SRS C-4).
- **Authorization.** JWT `role` claim. role middleware gate every /admin route. citizen token cannot hit officer API (SRS 4.2.2). Resource ownership check (citizen own data only, citizenId from token).
- **JWT.** HS256, secret in env, expiry 24h citizen / 8h officer inactivity. Stateless. Refresh token phase 2.
- **OTP.** 6 digit, hashed store, 5 min TTL, max 5 attempts, resend cooldown, rate limited (SMS-bomb guard).
- **Role management.** Enum citizen|officer phase 1. Fine-grained RBAC phase 2 (permissions[]).
- **File upload security.** multer + type whitelist (image/*, application/pdf), size <=5MB (SRS 4.2.1), rename, Cloudinary store not local disk, scan mime not just extension.
- **Input validation.** zod every endpoint. Mongoose schema second gate. Sanitize text (strip HTML) prevent XSS/injection.
- **Rate limiting.** express-rate-limit. Aggressive auth/OTP, moderate global.
- **Helmet.** Security headers (CSP, HSTS, noSniff, frameguard).
- **CORS.** Allowlist citizen + admin origins only.
- **Environment variables.** All secrets (JWT secret, DB uri, Cloudinary, Twilio keys) in .env, never committed, .env.example template (SRS 4.3.3).
- **Audit logging.** Auth events + mutations + officer actions, timestamp + user id (SRS 4.2.2).
- **Data privacy.** Citizen PII minimal, HTTPS transit, no PII in URLs/logs, Indian data guidelines (SRS C-6).
- **OWASP protections.** Injection (zod+Mongoose), XSS (React escape + sanitize), CSRF (SameSite + Bearer token not cookie), broken auth (JWT+expiry), sensitive exposure (HTTPS+env), rate limit (brute force), security misconfig (helmet).

---

# 11 PWA Planning

- **Manifest.** manifest.webmanifest: name "Digital Gram Panchayat", short_name "DGP", start_url /, display standalone, theme+background color, lang, icons.
- **Icons.** 192, 512, maskable. public/icons/. Generated from single source (script).
- **Offline.** Service Worker cache app shell + static assets + last-fetched notices/schemes/tax (read-only). OfflineBanner shown.
- **Caching strategy.** App shell: cache-first. Static (js/css/img): stale-while-revalidate. API GET notices/schemes: network-first fallback cache. API mutations: never cache, queue if offline.
- **Service Worker.** vite-plugin-pwa (Workbox). Precache build assets. Runtime cache rules above.
- **Background sync.** Offline complaint submit queued IndexedDB, Background Sync flush on reconnect.
- **Push notifications.** Phase 2 (SMS/voice primary channel phase 1). Manifest ready.
- **Install prompt.** Capture beforeinstallprompt, custom "Add to Home Screen" button, dismiss handling.

**Why.** SRS C-2/C-3: installable, offline, 2G-usable. Workbox = tested caching, less bug than hand-rolled SW.

---

# 12 Performance Planning

- **Lazy loading.** Route-level React.lazy + Suspense. Each feature chunk load on demand.
- **Image optimization.** Cloudinary transform (resize, webp, quality). Client compress before upload. Thumbnails for lists.
- **Database indexes.** All frequent query fields indexed (section 4). 2dsphere location. text schemes. compound where filter+sort.
- **Code splitting.** Vite per-route + vendor chunk. Keep initial bundle small (2G target, SRS PR-2 5s on 3G).
- **Caching.** React Query stale-while-revalidate. SW static cache. HTTP cache headers static.
- **Bundle optimization.** Tree-shake, no moment (use date-fns), analyze bundle, drop unused shadcn.
- **API optimization.** Pagination all lists. Projection (return needed fields). Aggregate dashboard cached 60s. Lean Mongoose queries. Response gzip/brotli.
- Target metrics: API <3s, PWA load <5s 3G, list query <1s @10k, subsequent nav <2s cached (SRS PR-1,2,6).

---

# 13 DevOps Planning

- **Environment variables.** .env per app, .env.example committed. Render/Vercel dashboard secrets. Config validated at boot (fail fast).
- **Git strategy.** Monorepo, single repo, conventional commits (feat/fix/chore).
- **Branch strategy.** main (prod), develop (integration), feature/* per milestone/module. PR + review to develop, release merge to main.
- **CI/CD.** GitHub Actions: lint + typecheck + test on PR. On merge main: Vercel auto-deploy frontends, Render auto-deploy backend. Block deploy on red.
- **Deployment.** Frontends Vercel (static + SW). Backend Render web service. DB Atlas. Files Cloudinary.
- **Monitoring.** Render metrics + health check endpoint /api/health. Uptime monitor (99% SRS PR-5). Error tracking (Sentry optional).
- **Logging.** Structured logger (pino/winston). Request log + error trace. No secrets/PII.
- **Backups.** Atlas automated daily, geo-separate, 30-day restore (SRS 4.2.1). Backup verify script.

---

# 14 Testing Strategy

- **Unit.** Services (business logic) jest. Utils (id gen, otp, pdf). Frontend hooks + components React Testing Library. Each module core logic (SRS 4.3.6).
- **Integration.** API route + DB (test Mongo/memory-server) via supertest. Auth->complaint->status full path.
- **API testing.** Postman collection all endpoints, happy + error. Automated newman in CI.
- **Frontend testing.** Component render, form validation, RTL user-event, i18n render both languages.
- **End-to-end.** Playwright critical flows: register->complaint->track, officer login->approve dakhala, notice broadcast. Optional but recommended.
- **Manual.** Device test 360px width, 2G throttle, offline mode, GPS denied, Marathi rendering, install prompt. Officer UAT with client.
- Coverage target: services + auth 80%+.

---

# 15 Development Roadmap

Milestones, each independently testable. Order = dependency-safe.

### M1 Project Setup
- Objectives: monorepo, workspaces, three apps scaffold, shared package, lint/format/CI, env template, DB connect, health endpoint.
- Deliverables: repo skeleton, Vite+TS+Tailwind+shadcn both frontends, Express boot, Mongo connect, GitHub Actions.
- Dependencies: none.
- Complexity: Low. Risk: Low.
- Acceptance: all three apps run local, backend /api/health 200, CI green, shared package imported both frontends.

### M2 Auth
- Objectives: citizen register+OTP, officer login, JWT, role middleware, AuthContext.
- Deliverables: auth feature backend+frontend both apps, otp service, jwt, users+otps models.
- Dependencies: M1, SMS client (mock ok early).
- Complexity: Medium. Risk: Medium (OTP+SMS).
- Acceptance: register->OTP->verify->token; officer login; citizen token blocked on /admin; expired token 401.

### M3 Complaint Module
- Objectives: submit (GPS+photo), track, officer list/detail/status, map, SMS on update.
- Deliverables: complaints feature, Cloudinary upload, Leaflet, status flow, audit.
- Dependencies: M2, Cloudinary.
- Complexity: High. Risk: Medium (GPS, upload, map).
- Acceptance: submit with/without GPS, <=3 photo enforced, officer updates status, citizen gets SMS, citizen sees only own.

### M4 Notice Module
- Objectives: officer CRUD, public read, broadcast SMS/voice.
- Deliverables: notices feature, notifications dispatch, public routes.
- Dependencies: M2, SMS provider live.
- Complexity: Medium. Risk: Medium (broadcast scale).
- Acceptance: public read no auth, officer CRUD, broadcast queues N, soft delete.

### M5 Schemes Module
- Objectives: officer CRUD, citizen browse+search+detail.
- Deliverables: schemes feature, text search.
- Dependencies: M2.
- Complexity: Low. Risk: Low.
- Acceptance: search hits, external link, officer CRUD.

### M6 Tax Module
- Objectives: officer add/update+history, citizen view.
- Deliverables: tax feature, audit history, view UI.
- Dependencies: M2.
- Complexity: Medium. Risk: Low.
- Acceptance: update creates history, previous preserved, citizen own only.

### M7 Dakhala Module
- Objectives: apply+track+PDF download, officer approve(PDF gen)/reject(reason).
- Deliverables: dakhala feature, PDFKit cert (Marathi font), SMS, Cloudinary PDF.
- Dependencies: M2, Cloudinary, PDFKit.
- Complexity: High. Risk: High (PDF gen, Marathi font, access control).
- Acceptance: apply, approve generates PDF+SMS, reject requires reason, download own only.

### M8 Dashboard + Users + Reports
- Objectives: metrics, charts, activity, user manage, reports.
- Deliverables: dashboard+users+reports features.
- Dependencies: M3-M7 (data exists).
- Complexity: Medium. Risk: Low.
- Acceptance: counts correct, charts render, deactivate blocks login.

### M9 PWA + Offline + i18n polish
- Objectives: manifest, SW, offline read, background sync, install prompt, full Marathi.
- Deliverables: vite-plugin-pwa config, IndexedDB queue, locales complete.
- Dependencies: M3 (offline complaint queue).
- Complexity: Medium. Risk: Medium (SW quirks).
- Acceptance: installable, offline notices/schemes read, offline complaint syncs on reconnect, full lang toggle.

### M10 Security Hardening + Performance
- Objectives: helmet, cors, rate limit, sanitize, indexes, lazy load, bundle trim, audit complete.
- Deliverables: middleware, index migration, perf tuning.
- Dependencies: all features.
- Complexity: Medium. Risk: Medium.
- Acceptance: OWASP checks pass, load <5s 3G, list <1s @10k, rate limit works.

### M11 Testing + Docs
- Objectives: unit+integration+api tests, Postman, manuals, ADRs, API docs.
- Deliverables: test suites, docs/.
- Dependencies: all.
- Complexity: Medium. Risk: Low.
- Acceptance: coverage target met, CI runs tests, manuals delivered EN+MR.

### M12 Deployment + UAT
- Objectives: prod deploy all three, monitoring, backups, client UAT.
- Deliverables: live URLs, health monitor, backup verify.
- Dependencies: M1-M11.
- Complexity: Medium. Risk: Medium (env, CORS prod).
- Acceptance: live, 99% uptime monitor, backup restore tested, client sign-off.

---

# 16 AI Development Strategy

Goal: another AI implements each milestone consistent, low context loss, low token.

## Per-milestone prompt template
Give AI, each milestone:
1. This blueprint section 2 (architecture) + 3 (folder) + 4 (DB) once, pinned.
2. Milestone objective + acceptance from section 15.
3. Relevant module spec section 5.
4. Relevant API rows section 6.
5. shared/ schemas already defined (reference, don't redefine).
Prompt shape: "Implement M{n} {module}. Follow blueprint layers route->controller->service->model. Use shared zod schema {name}. Endpoints: {rows}. DB: {collection fields}. Acceptance: {criteria}. Output only files for this module. No architecture changes."

## Avoid context loss
- Pin blueprint sections 2,3,4 as persistent system context.
- One module per session. Don't mix.
- Keep shared/ types as contract — AI reads, never invents field names.
- After each module, append short "done state" note (files created, endpoints live) to running context, not full code.
- Use folder structure section 3 as map — AI always knows where file goes.

## Reduce token usage
- Don't paste whole prior code back. Reference file paths + shared types.
- Generate module-by-module, not whole app one shot.
- Shared schemas defined once, imported — no repeat.
- Ask diffs/edits not full-file rewrites after first version.
- Caveman-style terse prompts.

## Keep code consistent
- shared/ package = single source types+enums+validation. Both client+server import. No drift.
- Fixed layer pattern every backend feature (route->controller->service->model).
- Fixed feature-folder pattern every frontend module.
- Uniform response envelope `{success,data}` / `{success,error}`.
- Uniform error codes section 6.
- Lint + typecheck + prettier enforced CI = mechanical consistency.
- StatusBadge, ConfirmDialog etc reused, not re-created.

---

# 17 Risks

| Risk | Type | Mitigation |
|---|---|---|
| SMS/voice provider down/costly | Technical/External | Abstract notifications service, swap Twilio<->MSG91; cost guard confirm before 5000 send; queue+retry; log failures |
| OTP SMS abuse (bomb) | Security | Rate limit + resend cooldown + attempt lock |
| 2G/3G slow load fails SRS PR-2 | Performance | Code split, lazy load, image compress, SW cache, small bundle, measure on throttle |
| GPS denied/inaccurate | Technical | Graceful "Not Available", proceed without; show accuracy |
| Photo/PDF upload fail | Technical | Cloudinary retry, size/type validate client+server, clear error |
| Marathi font in PDF cert | Technical | Embed Devanagari font PDFKit, test render early (M7) |
| Offline sync conflict/dup | Technical | Idempotency key on queued complaint, dedupe server |
| JWT leak / token theft | Security | HTTPS only, short expiry, deactivate invalidates, no token in URL |
| NoSQL injection / XSS | Security | zod + Mongoose validate, sanitize, React escape, helmet |
| Broadcast 5000 under 30s | Performance | Async batch dispatch, provider bulk API, queue |
| CORS/env break in prod | Deployment | .env.example, config validate boot, staging test, allowlist origins |
| Vendor lock (Cloudinary/Atlas/Render) | Maintenance | Standard interfaces, env-driven, documented; portable Node/Mongo |
| Data loss | Maintenance | Atlas daily backup geo-separate, 30-day restore, verify script |
| Scope creep (RBAC, refresh token) | Project | Phase 2 deferral explicit in SRS; phase 1 lock |
| Single officer role too coarse | Maintenance | Design permissions[] hook now, implement phase 2 |
| Low digital literacy citizen | Adoption | Onboarding flow, plain Marathi, minimal input, big touch targets, manuals EN+MR |

---

# 18 Final Deliverables

When complete, exist:

- **Source code.** Monorepo: citizen PWA, admin portal, backend, shared package. Clean, lint-passing, typed.
- **Documentation.** This blueprint, ADRs, folder README, setup guide, .env.example each app.
- **API docs.** OpenAPI spec + Postman collection, all endpoints, request/response/errors.
- **Deployment.** Live URLs (Vercel x2, Render, Atlas, Cloudinary), CI/CD pipelines, health monitor, backup config.
- **Presentation.** Capstone slide deck: problem, architecture, demo, outcomes, tech stack.
- **Demo.** Working live demo, seeded data, both citizen + officer flows.
- **Testing reports.** Unit+integration+API coverage report, Postman/newman run, manual test checklist (device, 2G, offline, Marathi), UAT sign-off.
- **Architecture diagrams.** System architecture, deployment, data flow, auth flow, ERD.
- **User manual.** Citizen guide EN + MR, illustrated, PDF + in-app help.
- **Admin manual.** Officer guide, login/complaint/notice/dakhala/tax, PDF + tooltips.

---

End blueprint. Implementation may begin M1.
