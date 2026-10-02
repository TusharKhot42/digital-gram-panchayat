import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Boot fails fast if required vars are missing/invalid. Only vars this milestone actually
 * uses (NODE_ENV, PORT, MONGODB_URI) are required — secrets for features not built yet
 * (JWT, Cloudinary, SMS) stay optional so a fresh clone can boot before those are set up.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_VERSION: z.string().min(1).default('v1'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // Connection pool + timeouts. maxPoolSize caps concurrent DB sockets per app instance; scale
  // out by running more instances behind a load balancer rather than one huge pool.
  DB_MAX_POOL_SIZE: z.coerce.number().int().positive().default(50),
  DB_MIN_POOL_SIZE: z.coerce.number().int().nonnegative().default(5),
  DB_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  DB_SOCKET_TIMEOUT_MS: z.coerce.number().int().positive().default(45000),
  // Build indexes on connect. Fine for fresh/small deployments; set false on large existing
  // collections and run `npm run db:indexes` during a maintenance window instead.
  DB_AUTO_INDEX: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRY_CITIZEN: z.string().default('24h'),
  JWT_EXPIRY_OFFICER: z.string().default('8h'),

  CORS_ORIGIN_CITIZEN: z.string().url().default('http://localhost:5173'),
  CORS_ORIGIN_ADMIN: z.string().url().default('http://localhost:5174'),

  // Public base URL of this API — used to build absolute URLs for mock-mode uploads so the
  // served bytes resolve from the browser. In production, Cloudinary URLs are used instead.
  SELF_URL: z.string().url().default('http://localhost:5000'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  SMS_PROVIDER: z.enum(['mock', 'twilio', 'msg91']).default('mock'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  MSG91_API_KEY: z.string().optional(),
  MSG91_SENDER_ID: z.string().optional(),

  // Optional, pluggable email provider (none by default).
  EMAIL_PROVIDER: z.string().optional(),

  // Translation provider for automatic bilingual content. 'mock' (default) needs no API key.
  TRANSLATION_PROVIDER: z.string().default('mock'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment configuration:');
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  // Production hard guards — fail fast on unsafe config before accepting traffic.
  if (parsed.data.NODE_ENV === 'production') {
    const problems = [];
    if (/localhost|127\.0\.0\.1/.test(parsed.data.CORS_ORIGIN_CITIZEN))
      problems.push('CORS_ORIGIN_CITIZEN must be a public HTTPS origin, not localhost');
    if (/localhost|127\.0\.0\.1/.test(parsed.data.CORS_ORIGIN_ADMIN))
      problems.push('CORS_ORIGIN_ADMIN must be a public HTTPS origin, not localhost');
    if (/^mongodb:\/\/(localhost|127\.0\.0\.1)/.test(parsed.data.MONGODB_URI))
      problems.push('MONGODB_URI points at localhost in production');
    if (problems.length) {
      console.error('Unsafe production configuration:');
      problems.forEach((p) => console.error(`  ${p}`));
      process.exit(1);
    }
  }

  return parsed.data;
}

export const env = loadEnv();
