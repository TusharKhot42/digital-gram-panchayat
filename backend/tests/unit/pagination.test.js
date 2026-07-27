import { parsePagination } from '../../src/utils/pagination.js';
import { PAGINATION_DEFAULTS } from '@dgp/shared';

describe('parsePagination', () => {
  test('defaults when nothing supplied', () => {
    expect(parsePagination()).toEqual({
      page: PAGINATION_DEFAULTS.page,
      limit: PAGINATION_DEFAULTS.limit,
      skip: 0,
    });
  });

  test('clamps an absurd limit down to maxLimit (DoS guard)', () => {
    const { limit } = parsePagination({ limit: 9_999_999 });
    expect(limit).toBe(PAGINATION_DEFAULTS.maxLimit);
  });

  test('rejects zero / negative / non-numeric limit', () => {
    expect(parsePagination({ limit: 0 }).limit).toBe(PAGINATION_DEFAULTS.limit);
    expect(parsePagination({ limit: -5 }).limit).toBe(1);
    expect(parsePagination({ limit: 'abc' }).limit).toBe(PAGINATION_DEFAULTS.limit);
  });

  test('page is floored to >= 1 and drives skip', () => {
    expect(parsePagination({ page: 0 }).page).toBe(1);
    expect(parsePagination({ page: -3 }).page).toBe(1);
    const { page, limit, skip } = parsePagination({ page: 3, limit: 10 });
    expect({ page, limit, skip }).toEqual({ page: 3, limit: 10, skip: 20 });
  });
});
