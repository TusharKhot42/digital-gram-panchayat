/**
 * Seed one officer (admin-portal) account. Officers are never self-registered
 * (blueprint 5.1) — run this once per environment to create the first login.
 *
 *   node scripts/seed-admin.js
 *
 * Credentials come from env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME)
 * or fall back to safe local-dev defaults. Idempotent: updates the password if the
 * officer already exists.
 */
import { ROLES } from '@dgp/shared';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { User } from '../src/features/auth/user.model.js';
import { hashPassword } from '../src/utils/password.js';
import { logger } from '../src/utils/logger.js';

const email = (process.env.SEED_ADMIN_EMAIL || 'admin@dgp.local').toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
const fullName = process.env.SEED_ADMIN_NAME || 'Panchayat Officer';

async function run() {
  await connectDatabase();

  const passwordHash = await hashPassword(password);
  const existing = await User.findOne({ email, role: ROLES.OFFICER });

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.fullName = fullName;
    existing.isActive = true;
    await existing.save();
    logger.info(`Officer updated: ${email}`);
  } else {
    await User.create({ role: ROLES.OFFICER, fullName, email, passwordHash });
    logger.info(`Officer created: ${email}`);
  }

  logger.info(`Login with email "${email}" and the seeded password.`);
  await disconnectDatabase();
}

run().catch(async (err) => {
  logger.error('Seed failed', err);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
