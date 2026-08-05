# Portal audit & stabilization (Phase 1 + 1B)

Branch: `feature/portal-audit-stabilization`. Purpose: stabilize the existing application before
any new feature work. No features added, no architecture or authentication changed.

This document records every defect found, its root cause, the fix, and how the fix was
verified — plus, just as importantly, **what could not be verified in this environment**.

> **Two claims in this document were later found to be wrong.** Both are corrected in
> `ui-professionalization.md`, and are flagged here so nobody reads this file alone and is
> misled:
>
> 1. The "NOT VERIFIED — environment limitation" section below blames browser tooling for being
>    unable to reach the officer portal. That was not the cause. The officer portal forwards
>    unauthenticated visitors to the citizen origin, because there is one shared login page — so
>    every attempt landed on the citizen app by design. Signing in first makes it fully drivable.
> 2. The "Verified — no defect found" section states that the D3 overflow defect class "does not
>    exist in the officer portal". It did. Nine of thirteen officer screens scrolled sideways at
>    375px, by up to 546px, from the same `min-width: auto` cause at the layout level rather than
>    in `shrink-0`.

## Defect register

### D1 — "Too many requests" during ordinary local use

|                  |                                                                                                                                                                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Severity**     | High (blocks local development and demos)                                                                                                                                                                                                                                          |
| **Screen**       | Citizen login / welcome (any page, app-wide)                                                                                                                                                                                                                                       |
| **Symptom**      | A `Too many requests. Please try again later.` toast appears during normal browsing.                                                                                                                                                                                               |
| **Root cause**   | Only the _auth_ limiters were relaxed for development. The app-wide `generalLimiter` (100 requests / 15 min) still applied, and a normal local session — HMR reloads plus several public data fetches per page view — exhausts it.                                                 |
| **Fix**          | `backend/src/middlewares/rate-limit.middleware.js`: skip limiting whenever `NODE_ENV !== 'production'` via a single `LIMITS_DISABLED` flag; removed the per-limiter `isDev` ternaries so production values are the literal, audited numbers again (auth 20, per-account login 10). |
| **Verification** | 130 consecutive requests to `/api/v1/village` → **130 × HTTP 200, zero 429** (previously 429 after 100). Production behaviour unchanged by inspection: `LIMITS_DISABLED` is false when `NODE_ENV=production`.                                                                      |

### D2 — "Government schemes" block misaligned on the public home page

|                  |                                                                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Severity**     | Medium (visible on the public landing page)                                                                                                                                                                                                |
| **Screen**       | Public welcome (`/welcome`)                                                                                                                                                                                                                |
| **Symptom**      | The Government schemes section rendered narrower and left-shifted versus every other section.                                                                                                                                              |
| **Root cause**   | The notices + schemes block nested two full `max-w-5xl` centred `<Section>` components _inside_ a `md:grid-cols-2` grid. Each centred within its **grid column**, not the page; with only schemes present it sat alone in the left column. |
| **Fix**          | `PublicHome.jsx`: one page-level `max-w-5xl` container holding a two-column inner grid, so the block shares the page axis and a single list spans the full width.                                                                          |
| **Verification** | Measured in the browser at 1280 px: schemes section bounds `left 120, width 1024` — **identical to the services and emergency sections**. No horizontal overflow.                                                                          |

### D3 — Horizontal overflow at 320 px in Marathi

|                  |                                                                                                                                                                                                                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Severity**     | High (breaks the smallest supported viewport)                                                                                                                                                                                                                                                                                                                  |
| **Screen**       | Citizen `/notifications` (bottom navigation appeared as the offender)                                                                                                                                                                                                                                                                                          |
| **Symptom**      | 25 px of horizontal overflow; the page scrolled sideways at 320 px width in Marathi.                                                                                                                                                                                                                                                                           |
| **Root cause**   | Two layers. (1) The notifications header action group was `flex shrink-0`; the Marathi "mark all as read" label (`सर्व वाचले म्हणून चिन्हांकित`, 261 px) refused to shrink and pushed the document to 345 px. (2) The fixed `inset-x-0` bottom nav then stretched to the **document** width, so it _measured_ as the widest element and masked the true cause. |
| **Fix**          | `NotificationCenter.jsx`: header row `flex-wrap`, action group `min-w-0` (not `shrink-0`), label `truncate`, icon `shrink-0`. `BottomNav.jsx` hardened independently: `min-w-0` on each cell (flex items default to `min-width:auto` and cannot shrink below their label) and `truncate` on the label.                                                         |
| **Verification** | Re-ran the sweep at **320 px in Marathi across 12 citizen routes → zero overflow, zero console errors** (previously 1 route with 25 px).                                                                                                                                                                                                                       |

### D4 — Missing Marathi keys rendered raw to the user

|                  |                                                                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Severity**     | Medium (untranslated UI for Marathi users)                                                                                                                                                |
| **Screen**       | Citizen dashboard                                                                                                                                                                         |
| **Symptom**      | Raw i18n keys (`home.statusTitle`, `home.unread`) displayed instead of text.                                                                                                              |
| **Root cause**   | Keys were added to `en/common.json` only; nothing enforced parity.                                                                                                                        |
| **Fix**          | Added the missing Marathi values, plus `i18n-parity.test.js` locking key parity and interpolation-placeholder parity.                                                                     |
| **Verification** | Parity check across both apps: citizen **466 = 466 keys**, officer **642 = 642 keys**, zero missing either direction. Test fails the build if a future key is added to one language only. |

### D5 — Officer portal had no i18n parity guard (Phase 1B)

|                  |                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Severity**     | Low (latent regression risk, no current user-visible defect)                                                           |
| **Screen**       | Officer portal (all)                                                                                                   |
| **Symptom**      | None today; the officer catalogue is the larger of the two (642 keys) and had no guard against the D4 class of defect. |
| **Root cause**   | The parity test added in Phase 1 covered only the citizen app.                                                         |
| **Fix**          | Added `frontend/admin-portal/src/test/i18n-parity.test.jsx` mirroring the citizen guard.                               |
| **Verification** | Officer test suite 5 → **8 tests, all passing**; parity confirmed at 642 = 642 keys.                                   |

## Verified — no defect found

- **Citizen routes, 1280 px (English):** 12 routes — correct headings, zero overflow, zero console errors.
- **Citizen routes, 375 px:** 12 routes — zero overflow.
- **Citizen routes, 320 px (Marathi):** 12 routes — zero overflow after D3.
- **Officer portal `shrink-0` usage:** every occurrence wraps a **fixed-size icon** (`h-8 w-8`, `h-12 w-12`, `h-11 w-11`, `h-12 w-16`), never variable-length text — the D3 defect class does not exist in the officer portal.
- **Untranslated strings:** the only English-identical Marathi values are `reports.exportExcel` = "Excel" and `reports.exportPdf` = "PDF" — format/product names, correctly left untranslated.
- **Complaint resolution validation:** resolving without a remark is correctly rejected (`400`, "A remark is required when resolving a complaint").

## End-to-end workflow verification (API level)

Every citizen and officer workflow was exercised against the running API and asserted on
status codes and returned data — **33/33 steps pass**.

| Actor   | Workflows exercised                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Citizen | Register, login, submit complaint **with image upload**, track complaint, apply for **Residence / Birth / Death / Other** certificates (each with its required document set), track applications, view notices, view schemes, view tax, receive notifications, **download the generated certificate** (verified the bytes really are a PDF — `%PDF-`, 5,146 bytes), **verify the QR** via the public no-auth endpoint (`valid: true`)                              |
| Officer | Login, review complaint, **resolve complaint with remark**, create + publish notice, publish scheme, create event, review certificate application, **approve → generate certificate** (`CERT-RES-2026-000001`), create tax record **with an uploaded PDF bill**, record payment (balance recalculated 2000 → 1500), broadcast notification, update village profile, update directory members, read audit log, users list, dashboard metrics/charts/activity/report |

Three initial "failures" were **defects in the test script, not the application** — a notice sent
`description` instead of the required `content`, a complaint status sent `note` instead of the
required `remark`, and the dashboard was called at `/admin/dashboard` instead of
`/admin/dashboard/metrics` (the 404 was correct). All three passed once corrected; no
application change was made for them.

## Data validation — dashboard vs database

Officer dashboard metrics compared against direct MongoDB counts. **All 10 fields match exactly:**

| Metric               | Dashboard | Database |
| -------------------- | --------- | -------- |
| totalCitizens        | 4         | 4        |
| totalComplaints      | 4         | 4        |
| pendingComplaints    | 2         | 2        |
| resolvedComplaints   | 2         | 2        |
| totalNotices         | 4         | 4        |
| totalSchemes         | 2         | 2        |
| totalCertificates    | 5         | 5        |
| approvedCertificates | 2         | 2        |
| totalTaxRecords      | 2         | 2        |
| outstandingTax       | 1940      | 1940     |

## NOT VERIFIED — environment limitation (stated explicitly)

The officer portal **could not be verified in the browser** in this session. The backend (5000)
and the officer dev server (5174) both started and answered HTTP 200, but every attempt to drive
5174 through the browser tooling — `preview_start` by URL, `navigate`, a new tab, and a managed
`preview_start` by launch-config name — resolved its JavaScript execution context back to the
citizen server on 5173. The officer portal was therefore audited **at the API and source level
only**.

Consequently the following remain **unverified**, and Phase 1 should not be declared complete on
their behalf:

- Officer portal UI: rendering, loading/empty/error states, dialogs, tables, pagination,
  sorting, filtering, and uploads **as seen in the browser**.
- Officer portal responsive behaviour at any breakpoint.
- **Dark theme** on either portal (no page was inspected with `data-theme="dark"`).
- Breakpoints 360 / 390 / 414 / 480 / 600 / 768 / 820 / 1024 / 1440 / 1920 (verified: 320, 375, 1280).
- Keyboard navigation, tab order and screen-reader behaviour as experienced by an assistive tool.

To close these, run the officer portal and drive it from a browser that can reach
`http://localhost:5174` directly.

## Quality gate

| Check           | Result                                           |
| --------------- | ------------------------------------------------ |
| `npm run lint`  | 0 errors, 0 warnings                             |
| `npm test`      | 250 passing (222 backend, 20 citizen, 8 officer) |
| `npm run build` | both apps build                                  |
