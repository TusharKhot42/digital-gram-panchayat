import mongoose from 'mongoose';
import { FEEDBACK_CATEGORIES, FEEDBACK_RATING_MIN, FEEDBACK_RATING_MAX } from '@dgp/shared';

const { Schema, model } = mongoose;

export { FEEDBACK_CATEGORIES };

/**
 * A citizen's rating of one village service.
 *
 * `citizenId` is always stored, even when the citizen ticks "submit anonymously" — it is what
 * stops one person rating the same service fifty times, and the officer portal needs to be able
 * to act on abuse. What "anonymous" controls is *disclosure*: the service never returns the
 * citizen's name or id on an anonymous entry. Storing nothing at all would have made the
 * feature trivially ballot-stuffable, which is worse for the citizens whose ratings are honest.
 */
const feedbackSchema = new Schema(
  {
    category: { type: String, enum: FEEDBACK_CATEGORIES, required: true, index: true },
    rating: {
      type: Number,
      required: true,
      min: FEEDBACK_RATING_MIN,
      max: FEEDBACK_RATING_MAX,
    },
    comment: { type: String, default: '', trim: true, maxlength: 1000 },
    isAnonymous: { type: Boolean, default: false },

    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Officer analytics group by category over time; citizens read their own history.
feedbackSchema.index({ isActive: 1, category: 1, createdAt: -1 });
feedbackSchema.index({ citizenId: 1, createdAt: -1 });

export const Feedback = model('Feedback', feedbackSchema);
