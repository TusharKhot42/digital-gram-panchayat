import mongoose from 'mongoose';
import { MEETING_TYPES } from '@dgp/shared';

const { Schema, model } = mongoose;

export { MEETING_TYPES };

/** One numbered item on the agenda, in the order it will be taken up. */
const agendaItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { _id: true },
);

/**
 * A Gram Sabha or other statutory meeting.
 *
 * Deliberately separate from `events`: a meeting carries an agenda, a statutory notice PDF and
 * (afterwards) minutes and attendance, none of which an event has. Folding them together would
 * have meant a pile of always-null fields on every festival and health camp.
 *
 * Status is NOT stored. It is derived from the clock on read, because a stored status silently
 * goes stale the moment nobody is logged in to update it — a meeting would still read
 * "Upcoming" a week after it happened.
 */
const meetingSchema = new Schema(
  {
    meetingNumber: { type: String, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    meetingType: { type: String, enum: MEETING_TYPES, default: 'GramSabha', index: true },

    scheduledAt: { type: Date, required: true, index: true },
    // Used to decide when "Live" ends; defaults to two hours in the service.
    endsAt: Date,
    venue: { type: String, default: '' },

    agenda: { type: [agendaItemSchema], default: [] },
    noticeUrl: String,
    noticeName: String,
    bannerUrl: String,
    minutesUrl: String,

    isPublished: { type: Boolean, default: false, index: true },
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

// The citizen query: published meetings ordered by date.
meetingSchema.index({ isActive: 1, isPublished: 1, scheduledAt: -1 });

export const Meeting = model('Meeting', meetingSchema);
