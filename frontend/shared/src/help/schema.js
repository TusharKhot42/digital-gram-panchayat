/**
 * Help Center content model.
 *
 * The Help Center is **structured documentation, not a chatbot** — every word a citizen or
 * officer reads is authored here and reviewed, so the portal can never invent a procedure for a
 * legal document (a certificate, a tax demand). Content lives in the shared package so both
 * portals, the tests and any future export (print/PDF) read exactly the same source.
 *
 * Every user-facing string is a `{ en, mr }` pair. A topic renders only the fields it has, so a
 * shorter topic is valid — but `id`, `category`, `audience`, `title` and `steps` are required.
 *
 * @typedef {{ en: string, mr: string }} Localized
 *
 * @typedef {object} HelpStep
 * @property {Localized} text      Imperative instruction ("Open the Complaints tab").
 * @property {Localized} [note]    Optional clarification shown under the step.
 *
 * @typedef {object} HelpFaq
 * @property {Localized} q
 * @property {Localized} a
 *
 * @typedef {object} HelpTopic
 * @property {string} id                       Stable slug, used in the URL hash.
 * @property {string} category                 One of HELP_CATEGORIES.
 * @property {'citizen'|'officer'|'both'} audience
 * @property {Localized} title
 * @property {Localized} summary               One-line description for the list + search.
 * @property {number} [minutes]                Estimated time to complete.
 * @property {Localized[]} [requirements]      What the user needs before starting.
 * @property {HelpStep[]} steps                Ordered instructions.
 * @property {Localized[]} [notes]             Important notes / warnings.
 * @property {Localized[]} [mistakes]          Common mistakes to avoid.
 * @property {HelpFaq[]} [faqs]
 * @property {string[]} [related]              Other topic ids.
 * @property {string} [route]                  Deep link for the "Take me there" button.
 * @property {string[]} [screenshots]          Placeholder labels for future screenshots.
 * @property {{ en: string[], mr: string[] }} [keywords] Extra search terms (synonyms).
 */

/** Category ids, in display order. Labels live in each app's i18n under `help.category.*`. */
export const HELP_CATEGORIES = [
  'gettingStarted',
  'registration',
  'login',
  'language',
  'theme',
  'complaints',
  'certificates',
  'tax',
  'schemes',
  'notices',
  'events',
  'directory',
  'emergency',
  'notifications',
  'profile',
  'settings',
  'officerGuides',
];

/**
 * Pick the right side of a `{ en, mr }` pair, falling back to English.
 * Named `localizedText` rather than `pickLocale` because utils/i18n-content.js already exports
 * a `pickLocale` with a different signature — two identical names reaching the package barrel
 * via `export *` are ambiguous and get dropped from the public surface entirely.
 */
export function localizedText(value, lang) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return (lang === 'mr' ? value.mr : value.en) || value.en || '';
}
