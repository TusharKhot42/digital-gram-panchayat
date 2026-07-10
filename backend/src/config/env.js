import 'dotenv/config';
import { z } from 'zod';

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

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRY_CITIZEN: z.string().default('24h'),
  JWT_EXPIRY_OFFICER: z.string().default('8h'),

  CORS_ORIGIN_CITIZEN: z.string().url().default('http://localhost:5173'),
  CORS_ORIGIN_ADMIN: z.string().url().default('http://localhost:5174'),

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
  return parsed.data;
}

export const env = loadEnv();
