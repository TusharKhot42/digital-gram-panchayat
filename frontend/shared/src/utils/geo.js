/** @param {number} lat @returns {boolean} */
export function isValidLatitude(lat) {
  return typeof lat === 'number' && Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

/** @param {number} lng @returns {boolean} */
export function isValidLongitude(lng) {
  return typeof lng === 'number' && Number.isFinite(lng) && lng >= -180 && lng <= 180;
}

/** @param {number} lat @param {number} lng @returns {boolean} */
export function isValidCoordinate(lat, lng) {
  return isValidLatitude(lat) && isValidLongitude(lng);
}
