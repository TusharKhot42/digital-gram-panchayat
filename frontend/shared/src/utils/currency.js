/**
 * Format a rupee amount. Uses the Indian numbering system (₹1,23,456).
 * @param {number} amount
 * @param {'en'|'mr'} [locale]
 * @returns {string}
 */
export function formatCurrency(amount, locale = 'en') {
  const value = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat(locale === 'mr' ? 'mr-IN' : 'en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
