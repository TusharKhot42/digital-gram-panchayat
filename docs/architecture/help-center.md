# Help Center (Phase 2A)

Branch: `feature/help-center`. A bilingual, structured Help Center for citizens and officers.

## Why this is documentation, not a chatbot

The Help Center is **authored content**, deliberately not an AI assistant. Reasons, in order of
importance:

1. **It must never invent a procedure.** These guides tell a citizen which documents are required
   for a birth certificate and what a Gram Panchayat officer must do before issuing one. A
   generated answer that is 95% right is worse than useless here — it is a citizen turned away at
   the office. Every sentence is written and reviewable.
2. **It works offline.** Content ships in the bundle, so the citizen PWA can show a guide with no
   network — which is the situation many rural users are actually in.
3. **No API key, no per-request cost, no vendor dependency** for a government deployment.

Search is deterministic keyword matching, so its behaviour is testable and provable.

## Where the content lives

`frontend/shared/src/help/` — in the shared package so both portals, the tests and any future
export read exactly the same words.

| File                | Purpose                                                               |
| ------------------- | --------------------------------------------------------------------- |
| `schema.js`         | Content model + `HELP_CATEGORIES` + `localizedText()`                 |
| `topics.citizen.js` | 25 citizen topics                                                     |
| `topics.officer.js` | 10 officer guides                                                     |
| `index.js`          | `topicsFor`, `getTopic`, `categoriesFor`, `countFaqs`, `searchTopics` |

Every user-facing string is an `{ en, mr }` pair. A topic carries: title, summary, estimated
minutes, requirements, ordered steps (each with an optional note), screenshot placeholders,
important notes, common mistakes, FAQs, related topic ids, and a `route` for the deep link.

### Naming note

The locale helper is `localizedText`, **not** `pickLocale`. `utils/i18n-content.js` already
exports a `pickLocale` with a different signature; two identical names reaching the package
barrel through `export *` are ambiguous under the ES module spec and are dropped from the public
surface entirely — which broke the production build until the rename.

## Search

`searchTopics(query, { audience, category })`:

- Searches **both languages at once** — a Marathi reader can find a guide by typing "QR" or
  "PDF", and an English reader can type "दाखला".
- Every term in a multi-word query must match (AND), so "birth certificate" returns the birth
  guide rather than every certificate topic.
- Scores title hits above keyword hits above body hits, so the most relevant guide is first.
- Matches synonyms via per-topic `keywords` ("satbara" → 7/12 guide, "yojana" → schemes).
- Returns an empty list when nothing matches — it never guesses.

## Routes and entry points

| Portal  | Route                          | Reachable from                            |
| ------- | ------------------------------ | ----------------------------------------- |
| Citizen | `/help`                        | Header icon, Settings, public home footer |
| Officer | `/help` (within the admin app) | Sidebar                                   |

The open topic is held in the URL (`?topic=<id>`), so a specific guide can be linked or shared.

## Print, PDF and share

- **Print / Save as PDF** uses the browser's own print dialog (`window.print()`); the action bar
  and back link are `print:hidden` so the printed sheet is just the guide. "Save as PDF" is the
  destination the browser already offers — no extra dependency.
- **Share** uses the Web Share API where available, falling back to copying the link.

## Coverage

- **35 topics** across all 17 categories.
- Separate certificate guides for **Residence, Birth, Death and 7/12 + Other**, each listing the
  required document groups, and covering processing, approval, download and QR verification.
- FAQs attached to the topics where users actually get stuck (registration, login, complaints,
  certificates, tax).

## Tests

`frontend/citizen-pwa/src/test/help-content.test.js` — 19 tests guarding the two failure modes
that would silently mislead a user:

- **Every** localized string has both `en` and `mr` (a missing half would show English to a
  Marathi reader).
- Marathi is never a verbatim copy of the English.
- Unique ids, valid categories/audiences, no dangling `related` references.
- Audience filtering: citizens never see officer-only guides.
- Search: English query, Marathi query, synonym, multi-word precision, category filter, and the
  no-match case.

## Honest limitation — Marathi review

The Marathi is written to be plain and to reuse the words the interface itself uses, and the
tests prove it exists and is not copied English. They **cannot** prove it is idiomatic or that
the procedural detail is correct in Marathi. Before this reaches real citizens, a Marathi
speaker from the Gram Panchayat should read the certificate, tax and complaint guides — those
carry procedural consequences if a nuance is wrong.

Screenshot placeholders are labelled but no images are attached yet.
