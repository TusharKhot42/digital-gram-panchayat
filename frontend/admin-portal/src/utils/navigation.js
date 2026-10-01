/**
 * Resolves the logical parent route for hierarchical back navigation.
 * Prevents history loop/redundancy where clicking "Back" cycles through
 * previously visited tabs instead of going up to parent or home.
 *
 * @param {string} pathname Current route location (e.g. '/complaints/new', '/tax')
 * @param {string} [backTo] Optional explicit back target
 * @returns {string} Target route to navigate back to
 */
export function getBackRoute(pathname = '', backTo) {
  if (backTo) return backTo;
  if (!pathname || pathname === '/') return '/';

  const clean = pathname.replace(/\/+$/, '');
  const segments = clean.split('/').filter(Boolean);

  // Top-level module/tab (e.g. /complaints, /notices, /schemes, /tax, /dakhala, /reports, etc.)
  if (segments.length <= 1) {
    return '/';
  }

  // Nested routes (e.g. /complaints/:id, /notices/new, /notices/:id/edit, /dakhala/:id)
  // Navigate back to the parent module list (/complaints, /notices, /dakhala, etc.)
  return `/${segments[0]}`;
}
