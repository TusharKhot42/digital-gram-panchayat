# Offline Help Assistant (Phase 2B)

Branch: `feature/help-assistant`. A deterministic, offline question-answering assistant built on
the Phase 2A Help Center knowledge base.

## No language model — and why that is the right call here

There is **no OpenAI, Gemini, Claude or any other LLM** in this feature, by design:

1. **It must never invent a procedure.** The assistant answers "which documents do I need for a
   birth certificate?" A generated answer that is _plausible_ but wrong sends a citizen to the
   office with the wrong papers and a wasted trip. This matcher only ever **selects** an authored
   topic — it never **composes** text.
2. **It works with no network.** The whole knowledge base ships in the bundle. A citizen on a
   dead connection still gets the full answer.
3. **No API key, no per-request cost, no vendor dependency** for a government deployment.
4. **Its behaviour is provable.** Deterministic matching can be unit-tested; a model's output
   cannot be pinned the same way.

The trade-off is honest: it will not understand a freely-worded question the way a model would.
It compensates with synonyms and a fallback that admits uncertainty rather than bluffing.

## Pipeline

```
question
  → normalize    lowercase, strip punctuation, keep Devanagari marks
  → tokenize     drop stopwords (English + Marathi) and 1-char noise
  → detect lang  Devanagari present ⇒ 'mr'
  → expand       cross-language + colloquial synonyms
  → score        per-field weights: title 5, keywords 4, summary 2, body 1
  → confidence   coverage of the query (0.65) + match strength (0.35)
  → threshold    ≥0.62 answer · ≥0.30 clarify · below that, fallback
  → deep link    topic.route → "Take me there"
```

### Two bugs found while building this (both caught by tests)

- **Devanagari was being destroyed by normalization.** The first filter kept `\p{L}` (letters)
  and `\p{N}` (numbers). Devanagari vowel signs and the virama are **`\p{M}` combining marks**,
  so `तक्रार` became `तक र र` — every Marathi query would have silently failed to match. Fixed by
  keeping `\p{M}`.
- **Ranking by raw score returned the wrong guide.** Asking "birth certificate" ranked the
  _certificates overview_ above the _Birth certificate_ guide, because the overview repeats the
  word "certificate" in more fields. Now ranking is **confidence first, raw score only as the
  tie-breaker**: how much of the user's question a topic accounts for matters more than how often
  it repeats a term.

## Confidence bands

| Band       | Threshold | Behaviour                                                                      |
| ---------- | --------- | ------------------------------------------------------------------------------ |
| `answer`   | ≥ 0.62    | One guide: title, first four steps, deep link, full-guide link, related topics |
| `clarify`  | ≥ 0.30    | "I'm not certain which guide you need" + the closest topics to choose from     |
| `fallback` | below     | "I couldn't find a guide" + Help Center + Gram Panchayat office contact        |

**The assistant never fabricates an answer.** Both low-confidence paths route the user to
authored content or to a human — the office phone comes from the Village Profile, so it is the
real number an officer maintains.

## Interface

- **Floating launcher** pinned bottom-right, positioned above the bottom navigation on mobile so
  it never covers a nav item.
- **Bottom sheet on phones, anchored side panel on desktop** (`sm:` breakpoint).
- **Conversation history** within the session, newest reply scrolled into view, with **Clear**.
- **Suggested questions** are **context aware** — guides whose `route` matches the screen the
  user is currently on are offered first.
- **Deep links**: "Take me there" navigates into the app; "Full guide" opens the Help Center at
  that topic.
- Accessibility: `role="dialog"` + `aria-modal`, Escape closes, focus moves to the input on open
  and **returns to the launcher on close**, replies announced via `aria-live`.

## Tests

| File                     | Count | What it protects                                                                                                                                                                                                                                                                                                           |
| ------------------------ | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `help-matcher.test.js`   | 22    | normalize/tokenize/language detection/synonyms; correct guide for real English and Marathi questions; **never invents** (fallback on nonsense, clarify on vague input, threshold respected); audience isolation; context-aware suggestions                                                                                 |
| `HelpAssistant.test.jsx` | 14    | launcher → dialog, Escape/close, greeting + suggestions, context-aware suggestion for `/tax`, answering with the right guide **and the right deep-link hrefs**, Marathi question, multi-turn history, clear, disabled send on empty, no-match reply exposing Help Center **and the office phone**, clarify on a weak match |
| `help-content.test.js`   | 19    | (Phase 2A) bilingual parity of every authored string                                                                                                                                                                                                                                                                       |

## Honest limitations

- **Synonyms are a hand-written list.** A question phrased entirely outside the knowledge base's
  vocabulary will land in `clarify` or `fallback`. That is the intended failure mode — it points
  at the Help Center and the office rather than guessing — but it does mean the synonym table
  deserves review after real users try it, and the fallback rate is worth logging.
- **The Marathi caveat from Phase 2A still stands**: the tests prove Marathi exists and is not
  copied English; they cannot prove it is idiomatic. A Marathi speaker should review the
  certificate, tax and complaint guides before public release.
- The assistant is **citizen-side only** in this phase. The officer portal has the Help Center
  but not the floating assistant.
- Not yet verified in a real browser — the preview tooling in this environment could not reach
  the dev servers; behaviour is covered by component tests instead.
