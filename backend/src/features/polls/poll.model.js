import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const optionSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    // Denormalised tally. The votes collection stays the source of truth; this is what the
    // results screen reads so it does not aggregate the whole collection on every view.
    votes: { type: Number, default: 0, min: 0 },
  },
  { _id: true },
);

const pollSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    options: {
      type: [optionSchema],
      validate: [(v) => v.length >= 2, 'A poll needs at least two options'],
    },
    closesAt: Date,
    isPublished: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    totalVotes: { type: Number, default: 0, min: 0 },
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

pollSchema.index({ isActive: 1, isPublished: 1, createdAt: -1 });

/**
 * One citizen's vote.
 *
 * The unique compound index is the actual guarantee of "one vote per citizen" — not the
 * application check, which two concurrent requests can both pass. The service catches the
 * duplicate-key error and turns it into a clean 409, so the race ends in a correct answer
 * rather than a second vote.
 */
const pollVoteSchema = new Schema(
  {
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true, index: true },
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    optionId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

pollVoteSchema.index({ pollId: 1, citizenId: 1 }, { unique: true });

export const Poll = model('Poll', pollSchema);
export const PollVote = model('PollVote', pollVoteSchema);
