/**
 * Pick a localized value from a stored `i18n` block produced by the backend translation
 * service. Content authored by an officer in one language is stored as `{ field: { en, mr } }`;
 * citizens read it in their selected language. Falls back to the other language, then to the
 * original plain field, so nothing ever renders blank.
 *
 * @param {object} i18n   - the entity's `i18n` object (may be undefined)
 * @param {string} field  - field name, e.g. 'title'
 * @param {string} lang   - 'en' | 'mr'
 * @param {string} [fallback] - the original plain field value
 */
export function pickLocale(i18n, field, lang, fallback = '') {
  const isMr = String(lang || '')
    .toLowerCase()
    .startsWith('mr');
  const targetKey = isMr ? 'mr' : 'en';
  const entry = i18n && i18n[field];
  if (entry) {
    if (entry[targetKey]) return entry[targetKey];
    if (isMr && entry.mr) return entry.mr;
    if (!isMr && entry.en) return entry.en;
    if (entry.en || entry.mr) return entry.en || entry.mr;
  }
  return fallback;
}
