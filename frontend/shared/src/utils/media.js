/**
 * Media URL helpers shared by both portals.
 *
 * When a file lives on Cloudinary we can ask their CDN for a resized, auto-format,
 * auto-quality derivative just by injecting a transformation segment after `/upload/` —
 * no re-upload, no server work. For local/mock URLs (dev) there is nothing to transform,
 * so the original URL is returned unchanged. Everything degrades gracefully.
 */

/** True for a Cloudinary delivery URL we can transform. */
function isCloudinary(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes('/upload/');
}

/**
 * A thumbnail derivative of an image URL. `width` drives a fill-crop; format and quality
 * are left to Cloudinary's `auto`. Non-Cloudinary URLs come back untouched.
 *
 * @param {string} url
 * @param {number} [width=400]
 * @returns {string}
 */
export function thumbnailUrl(url, width = 400) {
  if (!isCloudinary(url)) return url;
  return url.replace('/upload/', `/upload/c_fill,w_${width},q_auto,f_auto/`);
}

/**
 * A bandwidth-friendly "preview" derivative (bounded, no crop) for inline display.
 * Non-Cloudinary URLs come back untouched.
 */
export function previewUrl(url, width = 1000) {
  if (!isCloudinary(url)) return url;
  return url.replace('/upload/', `/upload/c_limit,w_${width},q_auto,f_auto/`);
}

/**
 * Classify a stored document for the viewer. Prefers an explicit `type`, then the file
 * extension, so a record that only has a URL still renders correctly.
 *
 * @returns {'image'|'pdf'|'file'}
 */
export function documentKind({ type, url, name } = {}) {
  if (type === 'image' || type === 'pdf') return type;
  // Test name and url independently — concatenating them broke the end-anchor when only
  // one was present (a trailing space left "report.pdf " which never matches `\.pdf$`).
  const candidates = [name, url].filter(Boolean).map((s) => s.toLowerCase());
  const matches = (re) => candidates.some((s) => re.test(s));
  if (matches(/\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/)) return 'image';
  if (matches(/\.pdf(\?|$)/)) return 'pdf';
  return 'file';
}
