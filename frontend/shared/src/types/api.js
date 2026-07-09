/**
 * API envelope shapes, documented as JSDoc typedefs so editors still get shape hints
 * without TypeScript. Every backend response and every frontend consumer agree on this.
 *
 * @typedef {Object} ApiErrorDetail
 * @property {string} code
 * @property {string} message
 * @property {Object.<string,string>} [fields]
 *
 * @typedef {Object} PaginationMeta
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 *
 * @typedef {Object} HealthStatus
 * @property {'ok'|'degraded'} status
 * @property {number} uptime
 * @property {string} timestamp
 * @property {string} environment
 * @property {string} version
 */

export {};
