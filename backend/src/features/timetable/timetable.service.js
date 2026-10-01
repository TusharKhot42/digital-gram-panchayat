import {
  TimetableModel,
  DEFAULT_GHANTAGADI_SCHEDULE,
  DEFAULT_WATER_SCHEDULE,
} from './timetable.model.js';

export const timetableService = {
  async getTimetable() {
    let doc = await TimetableModel.findOne({ key: 'primary' }).lean();
    if (!doc) {
      doc = await TimetableModel.create({
        key: 'primary',
        ghantagadi: DEFAULT_GHANTAGADI_SCHEDULE,
        water: DEFAULT_WATER_SCHEDULE,
      });
      doc = doc.toJSON();
    }
    return {
      ghantagadi: doc.ghantagadi || DEFAULT_GHANTAGADI_SCHEDULE,
      water: doc.water || DEFAULT_WATER_SCHEDULE,
      updatedAt: doc.updatedAt,
    };
  },

  async updateTimetable({ ghantagadi, water }, userId) {
    const update = {};
    if (Array.isArray(ghantagadi)) update.ghantagadi = ghantagadi;
    if (Array.isArray(water)) update.water = water;
    if (userId) update.updatedBy = userId;

    const doc = await TimetableModel.findOneAndUpdate(
      { key: 'primary' },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    return {
      ghantagadi: doc.ghantagadi,
      water: doc.water,
      updatedAt: doc.updatedAt,
    };
  },

  async resetTimetable(userId) {
    const doc = await TimetableModel.findOneAndUpdate(
      { key: 'primary' },
      {
        $set: {
          ghantagadi: DEFAULT_GHANTAGADI_SCHEDULE,
          water: DEFAULT_WATER_SCHEDULE,
          updatedBy: userId,
        },
      },
      { new: true, upsert: true },
    ).lean();

    return {
      ghantagadi: doc.ghantagadi,
      water: doc.water,
      updatedAt: doc.updatedAt,
    };
  },
};
