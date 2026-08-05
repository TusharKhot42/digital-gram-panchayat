# Smart governance modules (Phase 4)

Branch: `feature/smart-governance-modules`, continuing `feature/final-citizen-experience`.

Five new feature modules. **Purely additive** — no existing model, endpoint, response shape or
auth rule was changed, so every earlier client keeps working.

| Module    | Public                                                            | Officer                         |
| --------- | ----------------------------------------------------------------- | ------------------------------- |
| Meetings  | `GET /meetings`, `/meetings/:id`                                  | `/admin/meetings` CRUD          |
| Projects  | `GET /projects`, `/summary`, `/:id`                               | `/admin/projects` CRUD          |
| Polls     | `GET /polls`, `POST /polls/:id/vote` \*                           | `/admin/polls` CRUD             |
| Feedback  | `GET /feedback/summary`, `POST /feedback` \*, `/feedback/mine` \* | `/admin/feedback`, `/analytics` |
| Downloads | `GET /downloads`, `POST /:id/open`                                | `/admin/downloads` CRUD         |

\* requires a signed-in citizen.

## The three decisions worth defending

### 1. Meeting status is derived, never stored

A stored status is correct only until the moment it should have changed. Nothing runs at 11am on
a Sunday to move a meeting from Upcoming to Completed, so a stored value would leave a meeting
advertising itself as upcoming a week after it was held. `statusOf()` computes it from
`scheduledAt`, `endsAt` (default: two hours) and the clock, on every read. The test asserts the
field is genuinely absent from the stored document.

### 2. One vote per citizen is an index, not an `if`

```js
pollVoteSchema.index({ pollId: 1, citizenId: 1 }, { unique: true });
```

An application-level "have you voted?" check is two queries with a gap in the middle, and two
concurrent requests both pass it. The unique index is what actually holds; the duplicate-key
error becomes a clean 409. Tallies are incremented **after** the vote row is safely written, so a
rejected duplicate can never inflate the count.

The test fires five simultaneous votes from one citizen and asserts exactly one 200, four 409s,
and a final tally of 1. An application-only check passes that only by luck.

**Tallies stay hidden until the citizen has voted** or the poll closes. Showing a running result
to someone who has not yet voted is a known way to bias the answer, and on a poll about where the
village spends money that bias is the entire point of asking. The API withholds the numbers, so
the client has nothing to leak.

Only publication and closing time are editable after creation. Editing the options once people
have voted would silently reassign their answers to something nobody chose.

### 3. Anonymous feedback stores the citizen but never discloses them

`citizenId` is always written, and an officer must be able to act on abuse. What "anonymous"
controls is **disclosure**: the service strips the identity on every read path, _including the
officer endpoint_. Anonymity an officer can see through is not anonymity. The test asserts the
officer list omits the name while the row remains linked in the database.

> **Corrected in Phase 5.** This section originally claimed that storing `citizenId` "stops one
> person rating the same service fifty times". It did not — nothing enforced any limit, and one
> citizen could move the published average alone. The guarantee now exists (unique index on
> `{citizenId, category}` plus an upsert, so rating again replaces the earlier score) but it was
> added in Phase 5, not here. The claim was false when this document was written.

## Money is clamped, because it is published

`amountSpent` can never exceed the sanctioned budget and `progress` is bounded to 0–100. These
numbers appear on a public page: "112% of budget utilised" reads as corruption when it is really
a typo. On create the validator **rejects** an impossible figure (400) rather than quietly
correcting it — the officer should know. On update, where no validator guards the path, the
service clamps. Both are tested.

Village totals are aggregated in MongoDB rather than by pulling every project into memory, so the
figure stays correct once there are hundreds of works and the page still asks for one screen.

## Citizen screens

Gram Sabha, works, polls, feedback and downloads, each with loading, error and illustrated empty
states, fully bilingual, reusing the existing design system.

- Progress and budget bars carry `role="progressbar"` with `aria-valuenow`, so the figure reaches
  anyone who cannot see the fill.
- The poll options are a real radio group before voting and result bars after.
- The star rating is a radio group underneath — keyboard operable and announced. A row of
  clickable icons would be neither.
- Add-to-calendar on a meeting reuses the `.ics` builder written for events; nothing new.

Quick services grew from eight tiles to twelve, and global search now indexes meetings, works,
polls and documents alongside everything else — still with no extra request, because the
dashboard already holds the lists.

## Officer screens

Management for meetings, works, polls and documents, plus feedback analytics (overall average,
per-service bars, six-month trend). The trend is drawn as plain bars: six counts do not justify
pulling a chart library into that screen's bundle.

## Verification

- **35/35** end-to-end checks against the running API at the time of this phase, covering
  derived status, hidden drafts, overspend clamping, hidden-then-revealed tallies, a rejected
  second vote, anonymity held against the officer endpoint, and citizens refused every `/admin`
  route. **That script has not been re-run since Phase 5 changed the feedback and update-
  validation behaviour**, so two of its assertions (repeat feedback, unvalidated PUT) no longer
  describe the current API. The behaviour they covered is now asserted by the Jest suites
  instead, which do run in CI.
- **28 integration tests** (`governance.test.js`) including the five-way concurrent vote.
- Both portals driven in the browser: five citizen routes and five officer routes render with
  live data, zero horizontal overflow, one `<h1>` each, complete Marathi on the citizen side.

Figures as at the end of Phase 4. Current totals are in the Phase 5 record; `npm test` now
reports **427**.

| Check           | Result (Phase 4)                                   |
| --------------- | -------------------------------------------------- |
| `npm run lint`  | 0 errors, 0 warnings                               |
| `npm test`      | 375 passing (250 backend, 101 citizen, 24 officer) |
| `npm run build` | both apps build                                    |

> **The coverage gate was failing when this phase was pushed** — statements 77.18 against a
> gate of 80, and all four metrics below threshold. `npm test` does not run coverage, so it went
> unnoticed until Phase 5 audited it. Fixed there.

## Not built, and why

| Asked for                                     | Status                                                                                                                                                                                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pinned announcement banner (Part 4)           | **Not built.** The notice model has no `isPinned` field. Adding one is a model change; the existing "latest announcement" row on the dashboard is the closest honest equivalent.                                                   |
| Activity history additions (Part 7)           | **Partly.** The profile already shows complaint, certificate and tax history plus recent activity. Notification history, downloaded-certificate and downloaded-receipt logs are not built: nothing records a per-citizen download. |
| Dashboard analytics charts (Part 8)           | **Partly.** Feedback analytics is built. Registration/complaint/certificate/tax trend charts already exist on the officer dashboard from an earlier phase; poll-participation and event charts are not added.                      |
| Events attended                               | Not built. Nothing records attendance.                                                                                                                                                                                             |
| Project gallery lightbox, meeting detail page | Not built. The first photo and the inline agenda cover the common case; a fuller gallery is follow-up work.                                                                                                                        |

## Honest limitations

- **No screenshots.** Capture times out in this environment, so everything above is measured —
  geometry, computed styles, response bodies — not looked at.
- **The officer screens were verified in English only.** Marathi keys exist and parity is
  test-enforced, but the officer governance screens were not re-read with the interface switched.
- **Responsive sweeps for the new routes were run at desktop width only.** The components follow
  the same `min-w-0` + `TableShell` patterns that the Phase 2 sweep proved, but that is an
  inference, not a measurement.
- File uploads (notice PDF, banner, project photos, documents) were exercised through the API
  contract and the multer middleware, **not** by actually uploading a file through the browser.
- The Marathi caveat from earlier phases stands: parity and rendering are proven, idiom is not.
