# Public Village Portal

Turns the app into a public-facing Gram Panchayat portal: signed-out visitors land on a
village home page instead of the login form, and every public fact comes from a
**Village Profile** an officer edits from the Admin Portal — so any panchayat can re-brand the
app by editing data, no code change. Feature branch: `feature/public-village-portal`.

## New database models

- **VillageProfile** — a singleton (`key: 'primary'`, unique). Sections: `general`
  (identity, location, description/history/vision/mission, logo, banner, lat/lng, map),
  `statistics` (free-form Mixed map — no schema change to add stats), `leadership`, `social`,
  and embedded arrays `awards[]`, `gallery[]`, `videos[]`, `services[]`, `emergencyContacts[]`.
  Auto-created empty on first read so the public page always renders.
- **Event** — title, description, banner, start/end, location, organizer, category (enum from
  `@dgp/shared.EVENT_CATEGORIES`), soft-deleted via `isActive`.

## New APIs (all additive)

| Method              | Path                    | Auth    | Purpose                                                    |
| ------------------- | ----------------------- | ------- | ---------------------------------------------------------- |
| GET                 | `/api/v1/village`       | public  | Village Profile (auto-creates default)                     |
| PUT                 | `/api/v1/admin/village` | officer | Edit profile — partial-merge sections + logo/banner upload |
| GET                 | `/api/v1/events`        | public  | Upcoming events only                                       |
| GET/POST/PUT/DELETE | `/api/v1/admin/events`  | officer | Event CRUD                                                 |

Partial-merge semantics: object sections (general/leadership/social/statistics) are shallow-
merged so editing one section never wipes another; array sections replace wholesale. Replaced
logo/banner assets are cleaned up via the existing `deleteAsset`.

## New pages

- **Public** (citizen PWA): `/welcome` — hero, statistics, service cards, latest 5
  notices/schemes, upcoming events, gallery, emergency contacts, location map, footer. All
  dynamic; empty sections don't render. `ProtectedRoute` now sends guests here (was `/login`);
  the authenticated app is unchanged.
- **Admin**: Village Profile editor (general/statistics/leadership/emergency/social + logo/
  banner) and Events manager (create + delete with confirm), both officer-only, in the sidebar.

## Backward compatibility

New collections, new routes, new public page — no change to any existing API, auth flow, or
schema. The only routing change is the guest redirect target. Verified end-to-end: an officer
edit to the village name/stats is immediately reflected by the public API and home page.

## Initial content — Sakharale (seed)

The profile ships empty; the deployment's real content is loaded once with an idempotent seed:

```
cd backend
npm run seed:village            # seeds only if the profile is still blank
npm run seed:village -- --force # re-apply the seeded sections
```

`scripts/seed-village.js` imports **Sakharale** (Walwa, Sangli, Maharashtra) from publicly
available figures — population 9,144 (M 4,809 / F 4,335), 1,949 families, 1,213 ha, 72.13%
literacy, SC 1,431 / ST 47, child population 1,034, sex ratio 901, bank & post office present,
PIN 415414 — plus the national emergency helplines (100/101/108/112/1912). Facts the source
does not publish (houses, voters, schools, hospitals, coordinates, leadership names, local
office numbers) are left blank or stored as `"Not Available"`, never invented. After the seed
the data lives in MongoDB and is edited **only** from Admin → Village Profile; the source site
is never queried at runtime. The seed is exported as `SAKHARALE_SEED` for reference.

## Home page sections

The public `/welcome` page renders, in order and only when data exists: hero, **About** (narrative
with a location-facts panel), statistics cards, service cards, latest notices/schemes, upcoming
events, gallery, **Achievements** (`awards[]`), emergency contacts, location map, and a full
**footer** (identity, in-page quick links, official Government of India / Maharashtra links, and
the Gram Panchayat office address, timings, phone, email, and copyright).

## Deferred (model supports, UI to follow)

- Admin management UI for `awards[]`, `gallery[]` (with categories/dates), `videos[]`, and
  configurable `services[]` — the model stores them and the public page renders `gallery`/
  `services` already; only the per-item admin editors (each needs image upload per row) are
  pending.
- The bespoke rural-Maharashtra **illustration set** (per-screen scenes) is a standalone art
  task; the portal currently uses the existing logo + uploaded village banner/gallery imagery.
