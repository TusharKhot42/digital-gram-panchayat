import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// One document per counter key (e.g. "complaint-2026"). Atomic $inc gives gap-free,
// race-safe sequential numbers for human-readable IDs.
const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = model('Counter', counterSchema);

/**
 * @param {string} key
 * @returns {Promise<number>} the next sequence value
 */
export async function getNextSequence(key) {
  const doc = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return doc.seq;
}

export { Counter };
