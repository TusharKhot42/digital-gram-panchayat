# UI verification & professionalization (Phase 2)

Branch: `feature/final-ui-professionalization`. Continues `feature/portal-audit-stabilization`.
UI, responsiveness and accessibility only — no backend, API or authentication change.

Every measurement below was taken in a real browser against the running app. Where something
could not be verified, it says so.

## The officer portal had never actually been opened

`portal-audit.md` closed Phase 1B with the officer portal listed as **NOT VERIFIED**: every
attempt to drive `localhost:5174` "resolved its JavaScript execution context back to the citizen
server on 5173", and it was recorded as a tooling limitation.

It was not a tooling limitation. **The officer portal forwards unauthenticated visitors to the
citizen origin**, because there is one shared login page:

```js
// admin-portal/src/features/auth/Login.jsx
const LOGIN_URL = `${import.meta.env.VITE_CITIZEN_URL || 'http://localhost:5173'}/login`;
```

Opening `:5174` while signed out therefore lands on `:5173` every time, by design. Signing in as
an officer first makes the whole portal drivable. Everything in this document follows from that.

A second, unrelated finding while diagnosing it: the dev server binds `localhost`, which Node
resolves to IPv6 `::1` only, so `http://127.0.0.1:5174` is refused. Worth knowing when testing
from a phone or another tool on the LAN.

## Defects found and fixed

### Responsive

| #   | Screen                      | Defect                                                                                         | Root cause                                                                                                                                                                                                                        |
| --- | --------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Officer, 9 of 13 screens    | Page scrolled sideways at 375px, up to **546px** of overflow                                   | `DashboardLayout`'s content column is a flex item. A flex item's default `min-width: auto` refuses to shrink below its content, so the `overflow-x-auto` already on `TableShell` could never engage.                              |
| R2  | Officer, below 768px        | **No navigation at all** — open a screen, no way to leave it                                   | The rail is `hidden md:flex` and nothing replaced it.                                                                                                                                                                             |
| R3  | Officer dashboard, 320px    | 38px overflow                                                                                  | Grid items also default to `min-width: auto`; the panel column sized itself to its widest row (341px inside a 288px grid).                                                                                                        |
| R4  | Officer, any short viewport | A tall dialog was clipped top and bottom with its **submit button off-screen and unreachable** | The panel had no max-height, and `body { overflow: hidden }` removed the only way to scroll to it.                                                                                                                                |
| R5  | Public home, 320px          | 63px overflow                                                                                  | Same `min-width: auto` on the two-column grid children; the column sized to the longest notice title so `truncate` never engaged. Earlier sweeps missed it because every seeded notice had expired, leaving the block unrendered. |

`min-w-0` is the fix in R1, R3 and R5 — the same root cause in three places, and the same class of
defect as D3 in Phase 1, which that audit had concluded "does not exist in the officer portal".

### Information architecture

| #   | Defect                                                                                                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I1  | The officer header hardcoded `dashboard.title`, so **every screen announced itself as "Dashboard"** — in an `<h1>`, competing with each page's own `<h1>`. Replaced with a route-derived breadcrumb. |
| I2  | The officer dashboard had **no `<h1>` of its own** (it borrowed the header's); Reports rendered **two**.                                                                                             |
| I3  | The header's "Officer profile" button was a **dead control** — no handler. Removed; the account and sign-out live in the rail and the new drawer.                                                    |
| I4  | The language and theme toggles carried **hardcoded English `aria-label`s**, invisible to the Marathi catalogue.                                                                                      |

### Theme (this is the part Phase 1B could not check at all)

`portal-audit.md`: "no page was inspected with `data-theme="dark"`". Doing so found systemic
failures. All ratios measured, not estimated.

| #   | Theme | Defect                                                                                                                                                                                                           | Fix                                                |
| --- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| T1  | Light | `--muted-foreground` was chosen for "4.6:1 **on white**". Secondary text sits on `--background` (#F8FAFC), where it measured **4.38:1** — under AA.                                                              | 47% → 45%: 4.83:1 on the page, 5.06:1 on a card.   |
| T2  | Dark  | `--primary` text on `--primary-subtle` measured **4.31:1**. That pair is the active sidebar item on **all 13** officer screens.                                                                                  | 22% → 19%: 4.69:1.                                 |
| T3  | Dark  | The citizen event hero was **unreadable at 1.02:1** — it mixed `from-primary … to-indigo-900` with `text-primary-foreground`, and in dark `--primary` lightens while `--primary-foreground` flips to near-black. | Fixed scrim colours + white text: 6.7:1 to 11.4:1. |
| T4  | Dark  | The hero countdown chip used `text-primary` on white: **3.17:1**.                                                                                                                                                | blue-900: 10.4:1.                                  |

Palette against the brief: light is a soft grey page with white cards, blue primary, amber accent,
subtle shadows; dark is `rgb(15,21,31)` navy with `rgb(21,28,41)` slate surfaces and `#608EF0`
blue. Neither theme uses pure black or pure white for a surface.

### Accessibility

**Accessible names.** Checked with `element.labels` — the browser's own answer, not a guess. The
labels rendered and looked right while being attached to nothing, so a screen reader announced
the fields with no name (WCAG 1.3.1 / 3.3.2 / 4.1.2).

- Citizen New Complaint (4 controls): `FormRow` and `CategorySelect` wrote `<label>` as a sibling
  with neither `htmlFor` nor nesting.
- Officer Notices / Schemes / Broadcast (19 controls): the same pattern. `NoticeForm` now uses the
  `Field` component that already existed for exactly this and also wires `aria-describedby` to the
  error.
- Officer Village Profile (40 controls): repeated list rows carried **only a placeholder**, which
  is not an accessible name.
- `GpsCapture` and `PhotoUploader` used `<label>` for a block heading a button — corrected to `<p>`.

**Touch targets** (WCAG 2.5.8, 24×24 minimum): the directory copy buttons were **22×22 and failed
outright** — now 36. Filter chips 34 → 36. Call/Email, the primary action on an official's card,
36 → 44.

**Reduced motion**: both portals already zeroed CSS transitions, but the citizen app animates page,
splash and onboarding transitions with framer-motion, which uses inline styles and rAF and ignored
that rule entirely. `MotionConfig reducedMotion="user"` makes it honour the setting.

**Not a defect, retracted**: a programmatic `.focus()` probe suggested there were no focus rings.
There are — a global `:focus-visible` rule, confirmed under a real Tab press. `.focus()` does not
reliably trigger `:focus-visible`.

### Citizen dashboard and events

The Part 4 order was already implemented; it was **verified in the browser** rather than assumed —
Welcome (97px), Upcoming Events (179px), Officials (459px), Quick Services (651px), Status (911px),
Notices (1240px), Schemes (1344px), Emergency (1475px) at 390×844, with the event hero fully
visible without scrolling and Quick Services above the long status section.

The event hero showed date, location and countdown but **not the time or the organizer**, both of
which the event model already carried and a citizen needs in order to attend. Added, along with a
shared locale-aware `formatTime`. The no-events empty state already existed and renders.

### Officer dashboard

Nine identical counters in a flat grid, none of them clickable: a pending complaint carried the
same weight as the number of registered citizens, and the page reported work without offering a way
into it. Now two labelled bands — **Needs your attention** (pending complaints, certificate
applications, outstanding tax) and **Village records** — with every card linking to the screen where
the work is done, and a tone on the two figures that represent unfinished work that drops back to
neutral at zero. No new metric was invented.

## Verification performed

| Sweep                                                                                                 | Result                             |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Officer, 22 routes × 320/360/375/390/414/480/600/768/820/1024/1280/1440/1920, English **and** Marathi | zero horizontal overflow           |
| Citizen, 15 routes × 320/360/375/414/480/600/768/1024/1440/1920, English **and** Marathi              | zero horizontal overflow           |
| Officer, 13 routes, light **and** dark                                                                | zero contrast failures             |
| Citizen, 12 routes, light **and** dark                                                                | zero contrast failures             |
| Officer, 17 routes — accessible names, alt text, duplicate ids                                        | zero issues                        |
| Citizen, 14 routes — same                                                                             | zero issues                        |
| md boundary at exactly 768px                                                                          | rail appears, hamburger disappears |
| 1920px                                                                                                | content capped at 1280 and centred |
| Notice form submitted end to end after the `Field` refactor                                           | saved, redirected                  |

## Quality gate

Figures as at the end of Phase 2; `npm test` now reports **427**.

| Check           | Result (Phase 2)                                  |
| --------------- | ------------------------------------------------- |
| `npm run lint`  | 0 errors, 0 warnings                              |
| `npm test`      | 330 passing (222 backend, 84 citizen, 24 officer) |
| `npm run build` | both apps build                                   |

22 tests added: 16 covering the officer shell (breadcrumb per route, single `<h1>`, drawer contents,
Escape, scrim, focus move, scroll lock, Tab wrap, dialog viewport fit) and 6 covering label
association and `formatTime`. The label tests assert on `element.labels`, which is what makes the
original defect visible at all — it is invisible to a snapshot.

## Honest limitations

- **No screenshots.** The browser tooling in this environment times out on capture, so everything
  here is measured (geometry, computed styles, contrast ratios, accessibility tree) rather than
  visually inspected. Type rhythm, spacing and "does it feel like a government service" are
  design judgements a person still needs to make by looking.
- **Contrast probes composite nothing.** Translucent layers (`bg-white/15` over the hero gradient)
  had to be composited by hand; a reported failure there was an artefact, and the real ratio is
  6.2–8.6:1. Similarly, reading computed styles immediately after a runtime theme toggle can
  return stale values — one apparent white-on-white failure disappeared after a clean reload. Both
  were checked before any change was made.
- **Marathi is verified for parity and overflow, not for idiom.** The Phase 2A caveat stands: a
  Marathi speaker should read the certificate, tax and complaint text.
- **Screen readers were not run.** Names, roles, labels and focus order were checked
  programmatically; that is not the same as hearing NVDA or TalkBack read a page.
- The officer portal still has **no floating help assistant** (citizen-side only, from Phase 2B).
- Directory member data in this environment is seeded test data, so the card was exercised with
  fixtures rather than real officials.
