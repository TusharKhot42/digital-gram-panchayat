/**
 * Seed the Village Profile singleton with the initial Sakharale dataset.
 *
 *   node scripts/seed-village.js          # seed only if the profile is still blank
 *   node scripts/seed-village.js --force  # overwrite the seeded sections
 *
 * This is a ONE-TIME import. Source: publicly available data on
 * https://villageinfo.in/maharashtra/sangli/walwa/sakharale/ (Census-derived figures).
 * After this runs, the data lives in MongoDB and is edited only from
 * Admin → Village Profile — the source site is never queried at runtime.
 *
 * Fields the source did not publish are intentionally left blank (never invented) so an
 * officer can fill them in later; some render as "Not Available" on the public page.
 * Idempotent: by default it will not clobber a profile an officer has already edited.
 */
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { VillageProfile } from '../src/features/village/village.model.js';
import { logger } from '../src/utils/logger.js';

/**
 * Initial Sakharale dataset — every value below is taken from the public source. Missing
 * facts (houses, voters, schools, hospitals, colleges, police station, coordinates,
 * leadership names, local office numbers) are omitted or marked "Not Available" rather
 * than guessed.
 */
export const SAKHARALE_SEED = {
  general: {
    villageName: 'Sakharale',
    panchayatName: 'Sakharale Gram Panchayat',
    taluka: 'Walwa',
    district: 'Sangli',
    state: 'Maharashtra',
    pinCode: '415414',
    description:
      'Sakharale is a village in Walwa taluka of Sangli district, Maharashtra — home to ' +
      '9,144 residents across 1,949 families, spread over 1,213 hectares.',
    history:
      'Sakharale lies in the Valva–Islampur block of Walwa taluka, Sangli district, and is ' +
      'administered by its own Gram Panchayat. A bank and a post office operate within the ' +
      'village. The nearest town is Uran Islampur, about 4 km away, while Sangli city is ' +
      'around 45 km away. The nearest railway station is Bhavani Nagar (roughly 5–10 km) and ' +
      'the nearest airport is Kolhapur (about 36 km), with public bus service connecting the ' +
      'village. The village PIN code is 415414.',
  },

  // Free-form statistics map — the single editable source for the "at a glance" cards.
  // "Not Available" is stored verbatim for facts the source did not publish, so the public
  // page can distinguish an unknown value from a real one.
  statistics: {
    population: '9,144',
    malePopulation: '4,809',
    femalePopulation: '4,335',
    families: '1,949',
    area: '1,213 hectares',
    literacyRate: '72.13%',
    scheduledCaste: '1,431',
    scheduledTribe: '47',
    childPopulation: '1,034',
    sexRatio: '901 / 1000',
    schools: 'Not Available',
    hospitals: 'Not Available',
    banks: 'Available',
    postOffice: 'Available',
    roadConnectivity: 'Bus service available',
  },

  // Only genuine, nationally-published helplines are seeded. Village-specific numbers
  // (Gram Panchayat office, local hospital, water department) are left for the officer to
  // add from the Admin Portal — they are not public and are never invented here.
  emergencyContacts: [
    { label: 'Police', phone: '100' },
    { label: 'Fire', phone: '101' },
    { label: 'Ambulance', phone: '108' },
    { label: 'Emergency Helpline', phone: '112' },
    { label: 'Electricity (MSEDCL)', phone: '1912' },
  ],
};

async function run() {
  const force = process.argv.includes('--force');
  await connectDatabase();

  let doc = await VillageProfile.findOne({ key: 'primary' });
  if (!doc) doc = await VillageProfile.create({ key: 'primary' });

  if (doc.general?.villageName && !force) {
    logger.info(
      `Village Profile already set ("${doc.general.villageName}") — skipping. ` +
        'Re-run with --force to overwrite the seeded sections.',
    );
    await disconnectDatabase();
    return;
  }

  doc.general = { ...doc.general?.toObject?.(), ...SAKHARALE_SEED.general };
  doc.statistics = { ...(doc.statistics || {}), ...SAKHARALE_SEED.statistics };
  doc.emergencyContacts = SAKHARALE_SEED.emergencyContacts;
  await doc.save();

  logger.info(`Village Profile seeded: ${doc.general.villageName} (${doc.general.pinCode}).`);
  logger.info('Edit anything from Admin → Village Profile; the source site is not queried again.');
  await disconnectDatabase();
}

run().catch(async (err) => {
  logger.error('Village seed failed', err);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
