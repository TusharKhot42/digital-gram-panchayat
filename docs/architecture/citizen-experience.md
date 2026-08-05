# Citizen experience (Phase 3)

Branch: `feature/final-citizen-experience`, continuing `feature/final-ui-professionalization`.
Frontend only — no backend, API or authentication change, and no new endpoint.

## The rule this phase was built on

Everything on these screens comes from data the Gram Panchayat actually holds. Where the brief
asked for something the system does not record, the gap is left visible rather than filled with
a plausible-looking number. On a village portal a wrong figure is not a cosmetic bug: a citizen
acts on it.

| Asked for                            | What shipped                                                                                              |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Weather                              | A slot that shows no temperature. Nothing supplies weather; wire a provider and the chip fills itself in. |
| Office open / closed                 | Shown only when the profile carries office timings. Sakharale's are blank, so it is not shown.            |
| Achievements, seats, events attended | Not shipped. Nothing records them.                                                                        |
| Village statistics                   | Only the keys the profile carries. "Not Available" renders verbatim, never animated into a number.        |
| Emergency contacts                   | Only the numbers an officer has published (Police, Fire, Ambulance, Helpline).                            |
| Completed-events archive             | Not shipped. The public events endpoint returns upcoming only, and changing it is a backend change.       |

## The dashboard

Nine bands, in the order a villager needs them:

1. **Village hero** — the village leads, not the app. Banner, name, taluka and district, date,
   greeting, and language and theme switches within thumb reach of the first screen.
2. **Search** — see below.
3. **Today** — assembled per citizen: their own open complaints, applications, dues and unread
   messages first, then anything happening in the village today or tomorrow, then the latest
   announcement. Nothing outstanding reads as good news rather than as an empty card.
4. **Upcoming events** — a lead card plus two, each with date, time, location, organizer and a
   countdown.
5. **Quick services** — all eight entry points. Certificate verification and alerts were missing;
   "complaint" now opens the form rather than the history list.
6. **Officials**, 7. **Village in numbers**, 8. **Notices + schemes**, 9. **Emergency**.

Notices and schemes reuse the existing `NoticeCard` and `SchemeCard`; officials reuse
`OfficialCard`. No second set of markup was introduced for them.

### The counter bug worth recording

The statistics counters animate from zero on scroll. Neither `requestAnimationFrame` nor
`IntersectionObserver` runs while the document is hidden — the normal state of a backgrounded
PWA — so left to the callback the counters simply stayed at **0**. Measured in the browser:
`framesIn500ms: 0`, `visibilityState: "hidden"`.

A stalled counter does not look stalled. It looks like the village has a population of zero.

The animation is now strictly an enhancement: every path that cannot animate (reduced motion,
no `IntersectionObserver`, hidden document) settles on the real figure immediately, leaving the
tab mid-scroll settles it, and a timer backstops the animation itself. Four of the tests cover
exactly this, because jsdom has no `IntersectionObserver` and so reproduces the dead end.

## Search

One box, over everything already loaded — no endpoint, no extra request, so it works on the
offline PWA. It covers notices, schemes, the citizen's own complaints, certificate applications
and tax records, plus officials, events and the services themselves.

**Bilingual in both directions.** Notices and schemes are indexed in their English _and_ Marathi
fields, and service names through both catalogues, so `कर` finds Tax while the interface is in
English and `tax` finds it while the interface is in Marathi. A household often shares one phone
between a Marathi reader and an English one.

Matching reuses the Help Center's `normalize` rather than a second copy — which matters, because
a naive strip drops Devanagari combining marks and turns `तक्रार` into `तक र र`. Every term must
match, so "water notice" narrows; a miss says so plainly instead of offering something close.

## Events

Banner, date, time, location, organizer, countdown, and the two things a citizen actually wants:

- **Add to calendar** — an `.ics` built in the browser, accepted by Android, iOS, Outlook and
  Google Calendar. No backend and no third-party service. Fields are escaped (a raw `;` or `,`
  corrupts the entry) and an event with no end date is given an hour, because some calendars
  drop a zero-length event.
- **Share** — the Web Share API where available, clipboard otherwise.

## Profile

Applications in flight and certificates actually received are now separate figures; counting
every application as a certificate overstated what the citizen holds. Tax paid sits beside tax
due — the profile previously showed only the debt. Plus member-since, and language and theme
without a trip to Settings.

## Empty states

Seven inline SVG illustrations (complaints, certificates, notices, schemes, notifications, tax,
events). Inline rather than files: they ship in the bundle so they render offline, cost no
request, and paint with theme tokens, so one drawing is correct in both light and dark.
`EmptyState` keeps its old `icon` prop, so untouched call sites still work.

## Responsive defect found

The directory scrolled **68px** sideways at 320px. Grid cells default to `min-width: auto`, so a
card sized itself to its longest unbreakable content (a full office address or email). Phase 2
missed it because the directory then held one member with almost no data — the same shape of
miss as the public-home overflow that hid behind expired notices. **Thin fixtures hide layout
bugs.**

## Verification

| Sweep                                                                                          | Result                                                                    |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 13 citizen routes × 320/375/390/414/768/1024/1440, light **and** dark, English **and** Marathi | zero horizontal overflow                                                  |
| Same routes, contrast against WCAG AA                                                          | zero failures                                                             |
| Same routes — accessible names, labelled inputs, alt text, duplicate ids, one `<h1>` each      | zero issues                                                               |
| Search, driven in the browser                                                                  | `water` spans four record types; `कर` finds Tax from an English interface |

Two reported contrast failures were **measurement artefacts, checked before changing anything**:
the probe cannot see a `background-image` gradient on a `-z-10` layer, so it reported the hero's
white text against the page background. Composited against the real stops the ratio is
9.6–14.1:1.

## Quality gate

Figures as at the end of Phase 3; `npm test` now reports **427**.

| Check           | Result (Phase 3)                                   |
| --------------- | -------------------------------------------------- |
| `npm run lint`  | 0 errors, 0 warnings                               |
| `npm test`      | 347 passing (222 backend, 101 citizen, 24 officer) |
| `npm run build` | both apps build                                    |

17 tests added: ICS structure and escaping, search across types and both languages, AND-matching,
the honest no-result, Escape behaviour, and the counter's correctness when it cannot animate.

## Honest limitations

- **No screenshots.** Capture times out in this environment, so everything above is measured —
  geometry, computed styles, contrast ratios, the accessibility tree — not looked at. Whether it
  _feels_ like a government service is a judgement that still needs human eyes.
- **Marathi is verified for parity and layout, not idiom.** The new strings were written to match
  the vocabulary already in the interface; a Marathi speaker should still read them.
- **Directory and event content here is seeded test data**, so the cards were exercised with
  fixtures rather than real officials and real events.
- The count-up animation itself was never _seen_ running: the preview browser reports zero
  animation frames. Its correctness-under-failure is covered by tests; its smoothness is not.
