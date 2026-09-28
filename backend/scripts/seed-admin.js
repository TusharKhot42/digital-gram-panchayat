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
  
  // 1. Seed Officer Account
  const existingOfficer = await User.findOne({ email, role: ROLES.OFFICER });
  if (existingOfficer) {
    existingOfficer.passwordHash = passwordHash;
    existingOfficer.fullName = fullName;
    existingOfficer.isActive = true;
    await existingOfficer.save();
    logger.info(`Officer updated: ${email}`);
  } else {
    await User.create({ role: ROLES.OFFICER, fullName, email, passwordHash });
    logger.info(`Officer created: ${email}`);
  }

  // 2. Seed Villager / Citizen Account
  const citizenEmail = 'citizen@dgp.local';
  const citizenPassword = 'Citizen@123';
  const citizenHash = await hashPassword(citizenPassword);
  const existingCitizen = await User.findOne({ email: citizenEmail });

  if (!existingCitizen) {
    await User.create({
      role: ROLES.CITIZEN,
      fullName: 'Sarang Patil',
      email: citizenEmail,
      mobile: '9822012345',
      passwordHash: citizenHash,
      ward: 'Ward 1 (Bazaar Area)',
      address: 'Main Road, Sakharale',
      isActive: true,
    });
    logger.info(`Demo Citizen created: ${citizenEmail}`);
  }

  logger.info('--- Database Seeded Successfully ---');
  logger.info(`Officer Login: "${email}" / "${password}"`);
  logger.info(`Citizen Login: "${citizenEmail}" / "${citizenPassword}" or Mobile "9822012345"`);
  await disconnectDatabase();
}

run().catch(async (err) => {
  logger.error('Seed failed', err);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
