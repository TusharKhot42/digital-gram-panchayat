import en from '@/locales/en/common.json';
import mr from '@/locales/mr/common.json';

/** Flatten a nested translation object to dotted keys ("dakhala.review.approve"). */
function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(acc, flatten(v, key));
    else acc[key] = v;
    return acc;
  }, {});
}

/**
 * Locks English/Marathi key parity for the officer portal — the citizen app already has this
 * guard, and the officer portal (the larger catalogue of the two) had none, so a key added to
 * one file and forgotten in the other would render the raw key to an officer.
 */
describe('i18n parity (officer portal)', () => {
  const flatEn = flatten(en);
  const flatMr = flatten(mr);

  it('every English key exists in Marathi', () => {
    expect(Object.keys(flatEn).filter((k) => !(k in flatMr))).toEqual([]);
  });

  it('every Marathi key exists in English', () => {
    expect(Object.keys(flatMr).filter((k) => !(k in flatEn))).toEqual([]);
  });

  it('interpolation placeholders match between languages', () => {
    const placeholders = (s) =>
      typeof s === 'string' ? (s.match(/\{\{\s*\w+\s*\}\}/g) || []).sort().join(',') : '';
    const mismatched = Object.keys(flatEn).filter(
      (k) => k in flatMr && placeholders(flatEn[k]) !== placeholders(flatMr[k]),
    );
    expect(mismatched).toEqual([]);
  });
});
