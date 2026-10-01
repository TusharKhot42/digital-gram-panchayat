/**
 * @param {Date|string} input
 * @param {'en'|'mr'} [locale]
 * @returns {string}
 */
export function formatDate(input, locale = 'en') {
  const date = typeof input === 'string' ? new Date(input) : input;
  const isMr = String(locale).toLowerCase().startsWith('mr');
  return new Intl.DateTimeFormat(isMr ? 'mr-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Clock time only, for when the date is already shown beside it (event cards, schedules).
 *
 * @param {Date|string} input
 * @param {'en'|'mr'} [locale]
 * @returns {string}
 */
export function formatTime(input, locale = 'en') {
  const date = typeof input === 'string' ? new Date(input) : input;
  const isMr = String(locale).toLowerCase().startsWith('mr');
  return new Intl.DateTimeFormat(isMr ? 'mr-IN' : 'en-IN', {
    timeStyle: 'short',
  }).format(date);
}

/**
 * @param {Date|string} input
 * @param {'en'|'mr'} [locale]
 * @returns {string}
 */
export function formatDateTime(input, locale = 'en') {
  const date = typeof input === 'string' ? new Date(input) : input;
  const isMr = String(locale).toLowerCase().startsWith('mr');
  return new Intl.DateTimeFormat(isMr ? 'mr-IN' : 'en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
