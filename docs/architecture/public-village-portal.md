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

## Deferred (model supports, UI to follow)

- Admin management UI for `awards[]`, `gallery[]` (with categories/dates), `videos[]`, and
  configurable `services[]` — the model stores them and the public page renders `gallery`/
  `services` already; only the per-item admin editors (each needs image upload per row) are
  pending.
- The bespoke rural-Maharashtra **illustration set** (per-screen scenes) is a standalone art
  task; the portal currently uses the existing logo + uploaded village banner/gallery imagery.
