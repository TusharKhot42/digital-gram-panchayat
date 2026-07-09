/**
 * @param {Date|string} input
 * @param {'en'|'mr'} [locale]
 * @returns {string}
 */
export function formatDate(input, locale = 'en') {
  const date = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat(locale === 'mr' ? 'mr-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * @param {Date|string} input
 * @param {'en'|'mr'} [locale]
 * @returns {string}
 */
export function formatDateTime(input, locale = 'en') {
  const date = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat(locale === 'mr' ? 'mr-IN' : 'en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
