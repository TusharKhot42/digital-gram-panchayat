import villageWelcome from '@dgp/shared/assets/images/hero/village-welcome.svg';
import gramPanchayatBanner from '@dgp/shared/assets/images/hero/gram-panchayat-banner.jpg';
import gramPanchayatOffice from '@dgp/shared/assets/images/hero/gram-panchayat-office.svg';
import digitalVillage from '@dgp/shared/assets/images/hero/digital-village.svg';
import citizenServices from '@dgp/shared/assets/images/hero/citizen-services.svg';
import agriculture from '@dgp/shared/assets/images/hero/agriculture.svg';
import villageDevelopment from '@dgp/shared/assets/images/hero/village-development.svg';
import republicDay from '@dgp/shared/assets/images/events/republic-day.svg';
import independenceDay from '@dgp/shared/assets/images/events/independence-day.svg';
import gramSabha from '@dgp/shared/assets/images/events/gram-sabha.svg';
import treePlantation from '@dgp/shared/assets/images/events/tree-plantation.svg';
import healthCamp from '@dgp/shared/assets/images/events/health-camp.svg';
import bloodDonation from '@dgp/shared/assets/images/events/blood-donation.svg';
import sports from '@dgp/shared/assets/images/events/sports.svg';
import cleaningDrive from '@dgp/shared/assets/images/events/cleaning-drive.svg';
import villageGathering from '@dgp/shared/assets/images/events/village-gathering.svg';
import villageEntrance from '@dgp/shared/assets/images/village/village-entrance.svg';
import waterTank from '@dgp/shared/assets/images/village/water-tank.svg';

/**
 * The banner artwork, addressed by name.
 */
export const HERO = {
  villageWelcome: gramPanchayatBanner,
  gramPanchayatBanner,
  gramPanchayatOffice,
  digitalVillage,
  citizenServices,
  agriculture,
  villageDevelopment,
  villageEntrance,
  waterTank,
};

export const EVENT_ART = {
  republicDay,
  independenceDay,
  gramSabha,
  treePlantation,
  healthCamp,
  bloodDonation,
  sports,
  cleaningDrive,
  villageGathering,
};

/*
 * Which picture goes with an event, matched on its title.
 *
 * Both scripts, because an event is titled in whichever language the officer typed it. Order
 * matters only in that the first hit wins; the fallback is the neutral gathering scene, so a
 * title that matches nothing still gets artwork rather than a blank grey band.
 *
 * This is presentation only — it reads the title and picks a picture. Nothing downstream
 * depends on the result, and a wrong guess costs a slightly off illustration, not a wrong fact.
 */
const EVENT_RULES = [
  [EVENT_ART.republicDay, ['republic', 'प्रजासत्ताक', '26 january', '26 जानेवारी']],
  [EVENT_ART.independenceDay, ['independence', 'स्वातंत्र्य', '15 august', '15 ऑगस्ट']],
  [EVENT_ART.gramSabha, ['gram sabha', 'gramsabha', 'ग्रामसभा', 'ग्राम सभा', 'meeting', 'सभा']],
  [EVENT_ART.treePlantation, ['tree', 'plantation', 'वृक्ष', 'रोप', 'लागवड']],
  [EVENT_ART.bloodDonation, ['blood', 'रक्तदान', 'रक्त']],
  [EVENT_ART.healthCamp, ['health', 'medical', 'camp', 'आरोग्य', 'शिबिर', 'लसीकरण']],
  [EVENT_ART.sports, ['sport', 'kabaddi', 'cricket', 'खेळ', 'क्रीडा', 'स्पर्धा']],
  [EVENT_ART.cleaningDrive, ['clean', 'swachh', 'स्वच्छ', 'सफाई']],
];

/**
 * Artwork for an event that carries no banner of its own.
 * @param {string} title
 * @returns {string} a bundled svg url — never undefined
 */
export function eventArtFor(title) {
  const t = (title || '').toLowerCase();
  const hit = EVENT_RULES.find(([, words]) => words.some((w) => t.includes(w)));
  return hit ? hit[0] : EVENT_ART.villageGathering;
}
