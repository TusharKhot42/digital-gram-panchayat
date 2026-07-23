import { ROLES } from '@dgp/shared';
import { VillageProfile } from './village.model.js';
import { uploadAttachment, deleteAsset } from '../../utils/upload.js';
import { writeAudit } from '../audit/audit.service.js';

/**
 * Fetch the singleton profile, creating an empty one on first access so the public page
 * always has something to render.
 */
export async function getOrCreate() {
  let doc = await VillageProfile.findOne({ key: 'primary' });
  if (!doc) doc = await VillageProfile.create({ key: 'primary' });
  return doc;
}

/** Public read — the whole profile, as stored. */
export async function getPublicProfile() {
  const doc = await getOrCreate();
  return doc.toJSON();
}

/**
 * Officer edit. Accepts a partial `body` (any subset of sections) plus optional logo/banner
 * files. Object sections are merged field-by-field so a partial save never wipes untouched
 * fields; array sections replace wholesale (the editor sends the full list). Nested JSON that
 * arrives as a string (multipart) is parsed. Replaced logo/banner assets are cleaned up.
 *
 * @param {string} officerId
 * @param {object} body
 * @param {{ logo?: object[], banner?: object[] }} [files]
 */
export async function updateProfile(officerId, body, files = {}) {
  const doc = await getOrCreate();

  const parse = (v) => {
    if (typeof v !== 'string') return v;
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  };

  // Object sections — shallow-merge so partial updates are safe.
  for (const section of ['general', 'leadership', 'social']) {
    if (body[section] !== undefined) {
      doc[section] = { ...doc[section]?.toObject?.(), ...parse(body[section]) };
    }
  }
  if (body.statistics !== undefined) {
    doc.statistics = { ...(doc.statistics || {}), ...parse(body.statistics) };
  }

  // Array sections — replace wholesale (editor submits the complete list).
  for (const section of [
    'awards',
    'gallery',
    'videos',
    'services',
    'emergencyContacts',
    'members',
  ]) {
    if (body[section] !== undefined) doc[section] = parse(body[section]) || [];
  }

  // Logo / banner uploads — replace and release the previous asset.
  const logoFile = files.logo?.[0];
  const bannerFile = files.banner?.[0];
  if (logoFile) {
    const prev = doc.general.logo;
    const up = await uploadAttachment(logoFile, 'village');
    doc.general.logo = up.url;
    await deleteAsset(prev);
  }
  if (bannerFile) {
    const prev = doc.general.banner;
    const up = await uploadAttachment(bannerFile, 'village');
    doc.general.banner = up.url;
    await deleteAsset(prev);
  }

  doc.updatedBy = officerId;
  await doc.save();

  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action: 'village.update',
    entity: 'villageprofiles',
    entityId: doc.id,
    after: { villageName: doc.general.villageName },
  });

  return doc.toJSON();
}
