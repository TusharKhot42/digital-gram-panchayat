import { MEMBER_CATEGORIES } from '@dgp/shared';

// Category display priority: office bearers first, then ward, committee, others.
const CATEGORY_RANK = Object.fromEntries(MEMBER_CATEGORIES.map((c, i) => [c, i]));

/** Members in display order: category priority, then the officer-set order, then name. */
export function sortMembers(members = []) {
  return [...members].sort((a, b) => {
    const ca = CATEGORY_RANK[a.category] ?? 99;
    const cb = CATEGORY_RANK[b.category] ?? 99;
    if (ca !== cb) return ca - cb;
    if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
    return (a.name || '').localeCompare(b.name || '');
  });
}

/** Whole years between two dates (0 if invalid). */
function wholeYears(from, to) {
  if (!from) return 0;
  const start = new Date(from);
  const end = to ? new Date(to) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  let years = end.getFullYear() - start.getFullYear();
  const m = end.getMonth() - start.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < start.getDate())) years -= 1;
  return Math.max(0, years);
}

/**
 * Tenure figures for a member card: years served so far and whole years remaining until termEnd.
 * Returns null fields when the dates aren't set, so the UI can hide what it doesn't have.
 */
export function tenureInfo(member) {
  const { termStart, termEnd } = member || {};
  const yearsServed = termStart ? wholeYears(termStart) : null;
  let remainingYears = null;
  if (termEnd) {
    const end = new Date(termEnd);
    if (!Number.isNaN(end.getTime()) && end > new Date()) {
      remainingYears = wholeYears(new Date(), end);
    } else {
      remainingYears = 0;
    }
  }
  return { yearsServed, remainingYears };
}
