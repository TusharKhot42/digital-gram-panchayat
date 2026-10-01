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
import { Event } from '../src/features/events/event.model.js';
import { Scheme } from '../src/features/schemes/scheme.model.js';
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

  // 3. Seed Sample Village Event (MSRTC NCMC Smart Card Camp for Women)
  const officerUser = await User.findOne({ email, role: ROLES.OFFICER });
  const existingEvent = await Event.findOne({ title: /NCMC/i });
  if (!existingEvent && officerUser) {
    const start = new Date();
    start.setDate(start.getDate() + 3);
    start.setHours(10, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    end.setHours(17, 0, 0, 0);

    await Event.create({
      title:
        'MSRTC NCMC Smart Card Distribution Camp for Women (महिलांसाठी अनिवार्य NCMC स्मार्ट कार्ड वाटप व नोंदणी शिबिर)',
      description:
        'Under the MSRTC Mahila Samman Yojana (50% travel concession), it is mandatory for all women beneficiaries to obtain the new NCMC (National Common Mobility Card) Smart Card. Sakharale Gram Panchayat in coordination with MSRTC Islampur Depot is organizing a special registration and card distribution camp. Required documents: 1) Aadhaar Card (Original & Xerox), 2) Passport size photo, 3) Mobile linked with Aadhaar.',
      startDate: start,
      endDate: end,
      location: 'Gram Panchayat Office Hall, Sakharale (ग्रामपंचायत सभागृह, साखराळे)',
      organizer: 'Gram Panchayat Sakharale & MSRTC Islampur Depot',
      category: 'GovernmentProgram',
      isActive: true,
      createdBy: officerUser._id,
    });
    logger.info('Sample Event created: MSRTC NCMC Card Camp');
  }

  // 4. Seed Sample Government Scheme (PM-KUSUM Solar Agricultural Pump Scheme)
  const existingScheme = await Scheme.findOne({ title: /KUSUM/i });
  if (!existingScheme && officerUser) {
    await Scheme.create({
      schemeId: 'SCH-2026-0001',
      title: 'PM-KUSUM Solar Agricultural Pump Scheme (सौर कृषी पंप योजना)',
      summary:
        'Up to 90% to 95% government subsidy for farmers to install solar water pumps for daytime irrigation.',
      description:
        'Under the PM-KUSUM (Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan) and Magel Tyala Saur Krishi Pump Yojana, eligible farmers in Sakharale can avail up to 90% to 95% financial subsidy for installing solar-powered agricultural water pumps. This scheme provides reliable daytime power for farm irrigation and reduces dependency on conventional electricity and diesel pumps.',
      category: 'Agriculture',
      eligibility:
        '1. Farmers possessing agricultural land in their name with an assured water source (well, borewell, or river).\n2. Farmers having no previous conventional agricultural power connection or on the waiting list.\n3. General, OBC, SC, and ST category farmers are eligible.',
      benefits:
        '1. 90% subsidy for General category and 95% subsidy for SC/ST farmers.\n2. Continuous, free solar power for daytime irrigation.\n3. Complete 5-year warranty, maintenance, and insurance cover.\n4. Available in 3 HP, 5 HP, and 7.5 HP capacities.',
      requiredDocuments: [
        '7/12 Extract & 8A (७/१२ उतारा व ८-अ नोंद)',
        'Aadhaar Card copy (आधार कार्ड प्रत)',
        'Bank Passbook copy (बँक पासबुक प्रत)',
        'Water Source Self-Declaration (पाण्याचा स्त्रोत स्वयंघोषणापत्र)',
        'Caste Certificate (if applicable) (जात प्रमाणपत्र, लागू असल्यास)',
      ],
      applicationProcess:
        'Apply online at the official MahaKusum portal (kusum.mahadiscom.in) or visit the Sakharale Gram Panchayat CSC Center with required documents.',
      officialWebsite: 'https://kusum.mahadiscom.in',
      isPublished: true,
      isActive: true,
      publishDate: new Date(),
      expiryDate: new Date('2027-03-31T23:59:59.000Z'),
      createdBy: officerUser._id,
      i18n: {
        title: {
          en: 'PM-KUSUM Solar Agricultural Pump Scheme',
          mr: 'पीएम-कुसुम सौर कृषी पंप योजना',
        },
        summary: {
          en: 'Up to 90% to 95% government subsidy for farmers to install solar water pumps for daytime irrigation.',
          mr: 'शेतकऱ्यांना दिवसा सिंचनासाठी सौर कृषी पंप बसविण्यासाठी ९०% ते ९५% सरकारी अनुदान.',
        },
        description: {
          en: 'Under the PM-KUSUM (Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan) and Magel Tyala Saur Krishi Pump Yojana, eligible farmers in Sakharale can avail up to 90% to 95% financial subsidy for installing solar-powered agricultural water pumps. This scheme provides reliable daytime power for farm irrigation and reduces dependency on conventional electricity and diesel pumps.',
          mr: 'पीएम-कुसुम (पंतप्रधान किसान ऊर्जा सुरक्षा व उत्थान महाभियान) आणि मागेल त्याला सौर कृषी पंप योजनेअंतर्गत साखराळे गावातील पात्र शेतकऱ्यांना सौर कृषी पंप बसवण्यासाठी ९०% ते ९५% पर्यंत आर्थिक अनुदान उपलब्ध आहे. यामुळे शेतकऱ्यांना शेतीसाठी दिवसा खात्रीशीर वीज मिळते आणि पारंपारिक वीज व डिझेल पंपांवरील अवलंबित्व कमी होते.',
        },
        eligibility: {
          en: '1. Farmers possessing agricultural land in their name with an assured water source (well, borewell, or river).\n2. Farmers having no previous conventional agricultural power connection or on the waiting list.\n3. General, OBC, SC, and ST category farmers are eligible.',
          mr: '१. स्वतःच्या नावावर शेतजमीन आणि पाण्याचा शाश्वत स्त्रोत (विहीर, कूपनलिका किंवा शेततळे) असणारे शेतकरी.\n२. पारंपारिक वीज जोडणी नसलेले किंवा प्रतीक्षा यादीतील शेतकरी.\n३. सर्वसाधारण, इतर मागासवर्गीय, तसेच अनुसूचित जाती व जमातीचे शेतकरी पात्र.',
        },
        benefits: {
          en: '1. 90% subsidy for General category and 95% subsidy for SC/ST farmers.\n2. Continuous, free solar power for daytime irrigation.\n3. Complete 5-year warranty, maintenance, and insurance cover.\n4. Available in 3 HP, 5 HP, and 7.5 HP capacities.',
          mr: '१. सर्वसाधारण प्रवर्गासाठी ९०% व अनु. जाती/जमातीसाठी ९५% अनुदान.\n२. दिवसा अखंड आणि मोफत सौर वीज.\n३. ५ वर्षांची सर्वसमावेशक देखभाल आणि विमा संरक्षण.\n४. ३ एचपी, ५ एचपी आणि ७.५ एचपी क्षमतेचे सबमर्सिबल पंप उपलब्ध.',
        },
        applicationProcess: {
          en: 'Apply online at the official MahaKusum portal (kusum.mahadiscom.in) or visit the Sakharale Gram Panchayat CSC Center with required documents.',
          mr: 'महाकुसुम पोर्टलवर (kusum.mahadiscom.in) ऑनलाइन अर्ज करा किंवा आवश्यक कागदपत्रांसह साखराळे ग्रामपंचायत आपले सरकार सेवा केंद्रास भेट द्या.',
        },
      },
    });
    logger.info('Sample Scheme created: PM-KUSUM Solar Pump Scheme');
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
