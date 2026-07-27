import { PAGINATION_DEFAULTS } from '@dgp/shared';

/**
 * Parse and CLAMP pagination params from a query. Defence in depth: even though the list
 * route validators cap `limit`, the services must never trust an unbounded value — a single
 * `?limit=9999999` (e.g. on a route that skipped validation) would otherwise pull an entire
 * collection into memory and stall the event loop for every other request. Page and limit are
 * forced into safe ranges here so no caller can ask for more than `maxLimit` rows at once.
 *
 * @param {{ page?: unknown, limit?: unknown }} [query]
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function parsePagination(query = {}) {
  const page = Math.max(1, Math.floor(Number(query.page)) || PAGINATION_DEFAULTS.page);
  const rawLimit = Math.floor(Number(query.limit)) || PAGINATION_DEFAULTS.limit;
  const limit = Math.min(PAGINATION_DEFAULTS.maxLimit, Math.max(1, rawLimit));
  return { page, limit, skip: (page - 1) * limit };
}
