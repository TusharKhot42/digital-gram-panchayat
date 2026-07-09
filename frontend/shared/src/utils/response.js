/**
 * @param {*} data
 * @returns {{ success: true, data: * }}
 */
export function successResponse(data) {
  return { success: true, data };
}

/**
 * @param {string} code
 * @param {string} message
 * @param {Object.<string,string>} [fields]
 * @returns {{ success: false, error: { code: string, message: string, fields?: object } }}
 */
export function errorResponse(code, message, fields) {
  return { success: false, error: { code, message, ...(fields ? { fields } : {}) } };
}
