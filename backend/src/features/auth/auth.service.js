import { ROLES } from '@dgp/shared';
import { User } from './user.model.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';
import { AppError } from '../../utils/app-error.js';
import { notifyWelcome } from '../notifications/notification.service.js';
import { writeAudit } from '../audit/audit.service.js';

/**
 * Register a citizen. Mobile must be unique. Returns sanitized user + JWT.
 * @param {{ fullName: string, mobile: string, password: string, village: string, ward?: string, address: string, email?: string }} input
 */
export async function registerCitizen(input) {
  const existing = await User.findOne({ mobile: input.mobile });
  if (existing) {
    throw new AppError(409, 'MOBILE_EXISTS', 'This mobile number is already registered');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    role: ROLES.CITIZEN,
    fullName: input.fullName,
    mobile: input.mobile,
    email: input.email || undefined,
    village: input.village,
    ward: input.ward || 'Ward 1',
    address: input.address,
    passwordHash,
  });

  // Fire a welcome in-app notification. Never let it break registration.
  await notifyWelcome({ recipientId: user.id, fullName: user.fullName }).catch(() => {});

  const token = signToken({ id: user.id, role: user.role, ward: user.ward });
  return { user: user.toJSON(), token };
}

/**
 * Log a citizen in with mobile + password.
 * @param {{ mobile: string, password: string, ward?: string }} input
 */
export async function loginCitizen({ mobile, password, ward }) {
  const user = await User.findOne({ mobile, role: ROLES.CITIZEN }).select('+passwordHash');
  await assertActiveCredentials(user, password);

  if (ward && !user.ward) {
    user.ward = ward;
  }
  user.lastLogin = new Date();
  await user.save();

  const token = signToken({ id: user.id, role: user.role, ward: user.ward });
  return { user: user.toJSON(), token };
}

/**
 * Single shared login: one identifier field that may hold a mobile number (citizen) or an
 * email address (officer or citizen with email). Finds the account whichever way the user
 * identifies themselves, verifies the password, and returns the JWT plus role — the shared
 * login page routes the browser to the right app from the role. The role-specific endpoints
 * above stay untouched for backward compatibility.
 * @param {{ identifier: string, password: string, ward?: string }} input
 */
export async function loginUnified({ identifier, password, ward }) {
  const id = String(identifier || '').trim();
  const query = /^[6-9]\d{9}$/.test(id) ? { mobile: id } : { email: id.toLowerCase() };
  const user = await User.findOne(query).select('+passwordHash');
  await assertActiveCredentials(user, password);

  if (ward && !user.ward) {
    user.ward = ward;
  }
  const isRoot = Boolean(
    user.isRootAdmin ||
    (user.role === ROLES.OFFICER &&
      user.email === (process.env.SEED_ADMIN_EMAIL || 'admin@dgp.local').toLowerCase()),
  );
  if (isRoot && !user.isRootAdmin) {
    user.isRootAdmin = true;
  }

  user.lastLogin = new Date();
  await user.save();

  const token = signToken({
    id: user.id,
    role: user.role,
    ward: user.ward,
    isRootAdmin: user.isRootAdmin,
  });
  return { user: user.toJSON(), token };
}

/**
 * Log an officer (admin portal) in with email + password.
 * @param {{ email: string, password: string }} input
 */
export async function loginOfficer({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase(), role: ROLES.OFFICER }).select(
    '+passwordHash',
  );
  await assertActiveCredentials(user, password);

  const isRoot = Boolean(
    user.isRootAdmin ||
    user.email === (process.env.SEED_ADMIN_EMAIL || 'admin@dgp.local').toLowerCase(),
  );
  if (isRoot && !user.isRootAdmin) {
    user.isRootAdmin = true;
  }

  user.lastLogin = new Date();
  await user.save();

  const token = signToken({
    id: user.id,
    role: user.role,
    ward: user.ward,
    isRootAdmin: user.isRootAdmin,
  });
  return { user: user.toJSON(), token };
}

/**
 * Register a new verified officer/admin account (restricted to Root Admin).
 * @param {{ fullName: string, email: string, password: string, mobile?: string, village?: string, address?: string }} input
 * @param {string} creatorOfficerId
 */
export async function registerOfficer(input, creatorOfficerId) {
  const creator = await User.findById(creatorOfficerId);
  const isRoot = Boolean(
    creator?.isRootAdmin ||
    (creator?.role === ROLES.OFFICER &&
      creator?.email === (process.env.SEED_ADMIN_EMAIL || 'admin@dgp.local').toLowerCase()),
  );
  if (!isRoot) {
    throw new AppError(
      403,
      'ROOT_ADMIN_REQUIRED',
      'Only root admin can register new administrators',
    );
  }

  const email = String(input.email || '')
    .trim()
    .toLowerCase();
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email address already exists');
  }

  if (input.mobile) {
    const existingMobile = await User.findOne({ mobile: input.mobile });
    if (existingMobile) {
      throw new AppError(409, 'MOBILE_EXISTS', 'This mobile number is already registered');
    }
  }

  const passwordHash = await hashPassword(input.password);
  const officer = await User.create({
    role: ROLES.OFFICER,
    isRootAdmin: false,
    fullName: input.fullName.trim(),
    email,
    mobile: input.mobile || undefined,
    village: input.village?.trim() || undefined,
    address: input.address?.trim() || undefined,
    passwordHash,
    isActive: true, // Verified admin, active immediately
  });

  await writeAudit({
    actorId: creatorOfficerId,
    actorRole: ROLES.OFFICER,
    action: 'admin.create',
    entity: 'users',
    entityId: officer.id,
    before: null,
    after: { id: officer.id, fullName: officer.fullName, email: officer.email, role: officer.role },
  });

  return officer.toJSON();
}

/**
 * @param {string} userId
 */
export async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }
  return user.toJSON();
}

/**
 * @param {string} userId
 * @param {{ fullName?: string, village?: string, ward?: string, address?: string, email?: string }} updates
 */
export async function updateProfile(userId, updates) {
  const allowed = {
    fullName: updates.fullName,
    village: updates.village,
    ward: updates.ward,
    address: updates.address,
    email: updates.email || undefined,
  };
  const user = await User.findByIdAndUpdate(userId, allowed, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }
  return user.toJSON();
}

/**
 * Same generic failure for missing user, wrong password, or deactivated account —
 * no user enumeration (blueprint 5.1 security).
 */
async function assertActiveCredentials(user, password) {
  const invalid = new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  if (!user) throw invalid;

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) throw invalid;

  if (!user.isActive) {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'This account has been deactivated');
  }
}
