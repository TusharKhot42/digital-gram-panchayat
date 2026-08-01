import mongoose from 'mongoose';
import { PROJECT_CATEGORIES, PROJECT_STATUSES, FUNDING_SOURCES } from '@dgp/shared';

const { Schema, model } = mongoose;

export { PROJECT_CATEGORIES, PROJECT_STATUSES, FUNDING_SOURCES };

/** A dated progress note, so a citizen can see how the work moved rather than one number. */
const milestoneSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    at: { type: Date, default: Date.now },
    progress: { type: Number, min: 0, max: 100 },
  },
  { _id: true },
);

const photoSchema = new Schema({ url: String, caption: String }, { _id: true });

/**
 * A village development work.
 *
 * Money is stored in whole rupees as a Number, matching the tax module, so the two agree when
 * they are ever reported together. `amountSpent` is what the Gram Panchayat has actually
 * released, and is never allowed to exceed the sanctioned budget in the service layer — a
 * utilisation bar over 100% would look like a data-entry joke on a public page.
 */
const projectSchema = new Schema(
  {
    projectNumber: { type: String, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, enum: PROJECT_CATEGORIES, default: 'Other', index: true },

    budget: { type: Number, default: 0, min: 0 },
    amountSpent: { type: Number, default: 0, min: 0 },
    fundingSource: { type: String, enum: FUNDING_SOURCES, default: 'Other' },

    contractor: { type: String, default: '' },
    engineer: { type: String, default: '' },
    location: { type: String, default: '' },

    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: PROJECT_STATUSES, default: 'Planned', index: true },
    startDate: Date,
    endDate: Date,

    photos: { type: [photoSchema], default: [] },
    milestones: { type: [milestoneSchema], default: [] },

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

// The citizen query: published works, newest first, filterable by status and category.
projectSchema.index({ isActive: 1, isPublished: 1, status: 1, createdAt: -1 });

export const Project = model('Project', projectSchema);
