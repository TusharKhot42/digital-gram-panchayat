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
  const s = `${name || ''} ${url || ''}`.toLowerCase();
  if (/\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/.test(s)) return 'image';
  if (/\.pdf(\?|$)/.test(s)) return 'pdf';
  return 'file';
}
