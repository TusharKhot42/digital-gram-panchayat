import { env } from './env.js';
import { isCloudinaryConfigured } from './cloudinary.js';
import { logger } from '../utils/logger.js';

/**
 * A one-line, secret-free snapshot of how the server is configured, plus production warnings
 * for anything running in a development-only fallback. Nothing here changes behaviour — it
 * makes the running configuration obvious in the logs and flags the gaps that matter before
 * real traffic (uploads that won't survive a redeploy, mock SMS/translation, etc.).
 *
 * The local fallbacks stay intact by design; in production they are surfaced as WARN, not
 * fatal, so a deploy still boots while the operator sees exactly what to finish wiring.
 */
export function logStartupDiagnostics() {
  const summary = {
    nodeEnv: env.NODE_ENV,
    apiVersion: env.API_VERSION,
    uploads: isCloudinaryConfigured ? 'cloudinary' : 'local-fallback',
    sms: env.SMS_PROVIDER,
    translation: env.TRANSLATION_PROVIDER,
    email: env.EMAIL_PROVIDER || 'none',
    corsCitizen: env.CORS_ORIGIN_CITIZEN,
    corsAdmin: env.CORS_ORIGIN_ADMIN,
  };
  logger.info('Configuration summary', summary);

  if (env.NODE_ENV !== 'production') return;

  // Production readiness — warn (never fail) so the deploy still comes up.
  const warnings = [];
  if (!isCloudinaryConfigured) {
    warnings.push(
      'Uploads are using the LOCAL disk fallback — files will NOT persist across redeploys. Set CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET.',
    );
  }
  if (env.SMS_PROVIDER === 'mock') {
    warnings.push('SMS_PROVIDER=mock — SMS/voice notifications are not actually delivered.');
  }
  if (env.TRANSLATION_PROVIDER === 'mock') {
    warnings.push(
      'TRANSLATION_PROVIDER=mock — bilingual content is tagged, not translated. Wire a real provider.',
    );
  }
  for (const w of warnings) logger.warn('Production readiness', { warning: w });
  if (warnings.length === 0) logger.info('Production readiness: all providers configured');
}
