# Digital Gram Panchayat — Design System

The visual language shared by the citizen PWA and the officer portal. Both apps consume the
same tokens, the same primitives and the same rules; where they differ, the difference is
deliberate and noted below.

## 1. Where the system lives

| Layer        | File                                                       | Role                                                                        |
| ------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| Tokens       | `frontend/{citizen-pwa,admin-portal}/src/styles/index.css` | CSS variables for colour, radius, focus, motion. Light + dark.              |
| Token bridge | `frontend/{citizen-pwa,admin-portal}/tailwind.config.js`   | Exposes tokens as Tailwind utilities (`bg-primary`, `text-body`, …).        |
| Primitives   | `src/components/ui/*`                                      | Button, Card, Input/Select/Textarea, Field, Chip, Table, Dialog.            |
| Patterns     | `src/components/*`                                         | PageHeader, EmptyState, Stepper, Timeline, Lightbox, Pagination, FilterBar. |

The two `index.css` files are identical except for the `.dgp-page` rule: `max-w-md` with its
own gutters on the citizen PWA (a phone column), `max-w-7xl` on the admin portal (a desk,
where `DashboardLayout` supplies the padding).

**Rule:** components never name a raw colour. Everything routes through a token, so the
palette can change in one file. This is enforced by convention plus the audit in §11.

## 2. Colour palette

| Role              | Hex       | Token                | Used for                                   |
| ----------------- | --------- | -------------------- | ------------------------------------------ |
| Primary           | `#166534` | `--primary`          | Brand, primary buttons, active nav, links  |
| Primary hover     | `#15803D` | `--primary-hover`    | Primary button/link hover                  |
| Primary light     | `#DCFCE7` | `--primary-subtle`   | Icon discs, active pills, soft brand fills |
| Secondary         | `#334155` | `--slate`            | Dense neutral text                         |
| Background        | `#F8FAFC` | `--background`       | Page canvas                                |
| Surface           | `#FFFFFF` | `--card`             | Cards, tables, dialogs                     |
| Surface secondary | `#F1F5F9` | `--secondary`        | Table headers, bill strips, inset rows     |
| Border            | `#E2E8F0` | `--border`           | Hairlines, dividers                        |
| Text primary      | `#0F172A` | `--foreground`       | Headings, values                           |
| Text secondary    | `#475569` | `--body-foreground`  | Long-form prose                            |
| Muted             | `#64748B` | `--muted-foreground` | Labels, captions, metadata                 |
| Success           | `#16A34A` | `--success`          | Paid, delivered, resolved                  |
| Warning           | `#F59E0B` | `--warning`          | Offline, cost warnings                     |
| Danger            | `#DC2626` | `--destructive`      | Errors, delete, dues                       |
| Info              | `#2563EB` | `--info`             | Queued, informational                      |
| Pending           | `#D97706` | `--pending`          | Awaiting-action states                     |

### The `-strong` variants exist for a reason

The mandated mid-tones are fill colours, not text colours. `#F59E0B` on its own subtle
background measures **2.1:1** — nowhere near the WCAG AA 4.5:1 floor for body text. Using it
for chip labels would have produced an inaccessible UI that matched the spec on paper.

So each semantic colour is split:

- `--warning` / `--success` / `--destructive` / `--info` — **fills, icons, dots, bars.**
- `--warning-strong` (`#B45309`, 4.7:1) and friends — **text on the matching `-subtle` background.**

This is a deliberate deviation from a literal reading of the palette, taken so that AA holds.
The specified hex values are all still present and still carry the meaning they were given.

## 3. Typography scale

Defined in `tailwind.config.js` as `fontSize` entries, so the name carries size, line-height
and weight together — there is no `text-lg font-semibold` guesswork at call sites.

| Token          | Size / line-height   | Weight | Used for                           |
| -------------- | -------------------- | ------ | ---------------------------------- |
| `text-display` | 28px / 34px, -0.02em | 700    | Page hero numbers, 404, splash     |
| `text-title`   | 20px / 28px, -0.01em | 600    | Page titles, card headline figures |
| `text-section` | 16px / 24px          | 600    | Section and card headings          |
| `text-body`    | 14px / 22px          | 400    | Body copy, table cells, controls   |
| `text-label`   | 13px / 18px          | 500    | Form labels, table headers         |
| `text-caption` | 12px / 16px          | 400    | Metadata, chips, helper text       |

Line-height is set at **1.55** on `body` — deliberately loose, because Devanagari ascenders
and descenders collide at the tighter ratios that suit Latin text alone.

Numbers that sit in columns or get compared (currency, counts, pagination) carry
`tabular-nums` so digits don't jitter between renders.

## 4. Spacing, radius, elevation

- **Spacing** follows an 8px grid via Tailwind's default scale; `0.5` (2px) steps are used
  only for optical nudges inside a component, never for layout.
- **Radius:** `--radius: 0.75rem` (12px), with `sm` 8px, `md` 10px, `lg` 12px, `xl` 16px.
- **Elevation** is four soft layered shadows (`shadow-xs`, `sm`, `md`, `overlay`) built from
  `rgb(16 24 40 / .04–.24)`. Cards rest at `xs` and lift to `sm` on hover. No hard drop
  shadows, no glows.

## 5. Motion

Every transition is **150ms** (`transitionDuration.DEFAULT`), scoped to the properties that
actually change (`transition-[box-shadow,transform]`), never `transition-all`. Pressable
surfaces take `active:translate-y-px`. The whole system is disabled under
`@media (prefers-reduced-motion: reduce)`.

## 6. Primitives

| Component                       | Notes                                                                                                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                        | Variants default/secondary/destructive/outline/ghost/link; sizes sm 36 / default 44 / lg 48 / icon 44. `loading` renders a spinner, sets `aria-busy`, disables. |
| `Card`                          | The one surface: border + `rounded-lg` + `shadow-xs`. `interactive` adds hover lift.                                                                            |
| `Input` / `Select` / `Textarea` | Share `controlClass`. **44px on citizen** (touch target), **40px on admin** (desktop density) — the only intentional cross-app divergence.                      |
| `Field`                         | Label + control + hint/error with `htmlFor`, `aria-describedby`, `role="alert"` wired.                                                                          |
| `Chip`                          | Status pill. Colour keys `red\|orange\|green\|blue\|grey` map to subtle-bg + strong-text + hairline ring. All three status badges delegate to it.               |
| `Table`                         | `TableShell` traps horizontal scroll; `THead` sticks; `TR` hovers; `SortableTH` carries `aria-sort`.                                                            |
| `Dialog`                        | Portal + scrim, Escape to close, focus in on open and restored on close, body scroll locked.                                                                    |

## 7. Patterns

`PageHeader` (back link + title + subtitle + action), `SectionHeader`, `EmptyState`
(icon disc + headline + guidance + the action that fixes it), `Stepper` (application
progress; a rejected item freezes at the stage that rejected it rather than faking a
position), `Timeline` (dot-and-rail history), `Lightbox`, `Pagination`, `FilterBar` /
`SearchInput`, `CenteredPanel` / `StatusPanel` (citizen: login, register, offline, 404).

## 8. Accessibility

- Global `:focus-visible` ring — 2px `--ring`, offset from the background, on every focusable.
- Touch targets ≥44px on the citizen PWA; ≥36px on admin controls, which are pointer-driven.
- Errors carry `role="alert"` and are linked by `aria-describedby`. Colour is never the only
  signal.
- Icons are `aria-hidden` when decorative; icon-only buttons carry `aria-label`.
- Toggles use `aria-pressed`; the FAQ uses `aria-expanded`/`aria-controls`; sortable headers
  use `aria-sort`; dialogs use `role="dialog"` + `aria-modal`.
- All text pairs clear WCAG AA (see §2 on why `-strong` exists).

## 9. Responsive

Layouts are fluid and verified at 320 / 375 / 425 / 768 / 1024 / 1280 / 1440px. Wide content
(tables, charts) scrolls inside its own container so the page body never scrolls sideways.
The citizen shell honours `env(safe-area-inset-*)` for notched devices.

## 10. Bilingual

Every string is an i18next key with **en/mr parity enforced** — no key exists in one locale
and not the other. Names, IDs and addresses are never translated. Layouts avoid fixed widths
because Marathi strings routinely run longer than their English equivalents.

## 11. Auditing the system

```bash
# Should print nothing: no component may name a raw palette colour.
grep -rlnE "(bg|text|border|ring)-(red|orange|green|blue|amber|gray|slate|emerald|yellow|indigo|purple|black|white)-[0-9]{2,3}|text-white|bg-black" \
  frontend/citizen-pwa/src frontend/admin-portal/src
```

The one legitimate hex list is `CHART_COLORS` in `frontend/shared/src/constants/index.js`:
recharts needs literal colours rather than CSS variables. Keep it in step with §2.

## 12. Known gap

**Pinned notices.** The UI asks for a "pinned" badge, but `notice.model.js` has no pinned
field — only `broadcast`. Rather than invent state the record doesn't hold, notices that went
out as a broadcast are badged as such. Real pinning needs a schema field and a sort key, i.e.
a backend change, and was left out of a UI-only pass.
