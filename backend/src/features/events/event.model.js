import mongoose from 'mongoose';
import { EVENT_CATEGORIES } from '@dgp/shared';

const { Schema, model } = mongoose;

export { EVENT_CATEGORIES };

/**
 * Village events shown on the public home page. A lightweight CRUD module — officers create
 * them, the public reads upcoming ones. Soft-deleted via `isActive` so history is preserved.
 */
const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    banner: String,
    startDate: { type: Date, required: true, index: true },
    endDate: Date,
    location: { type: String, default: '' },
    organizer: { type: String, default: '' },
    category: { type: String, enum: EVENT_CATEGORIES, default: 'Other', index: true },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

export const Event = model('Event', eventSchema);
