import mongoose from 'mongoose';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES, COMPLAINT_PRIORITIES } from '@dgp/shared';

const { Schema, model } = mongoose;

const remarkSchema = new Schema(
  {
    officerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, required: true, trim: true },
    // Auto-generated bilingual { en, mr } of the officer's remark.
    i18n: { type: Schema.Types.Mixed },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const statusEntrySchema = new Schema(
  {
    status: { type: String, enum: COMPLAINT_STATUSES, required: true },
    by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const complaintSchema = new Schema(
  {
    complaintId: { type: String, required: true, unique: true },
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, enum: COMPLAINT_CATEGORIES, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    images: {
      type: [String],
      default: [],
      validate: [(arr) => arr.length <= 3, 'A complaint can have at most 3 images'],
    },
    // GeoJSON Point [lng, lat]; optional (GPS may be denied).
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
    accuracy: { type: Number },
    address: { type: String, trim: true },
    ward: { type: String, trim: true, index: true },
    status: { type: String, enum: COMPLAINT_STATUSES, default: 'Pending', index: true },
    priority: { type: String, enum: COMPLAINT_PRIORITIES, default: 'Medium' },
    remarks: { type: [remarkSchema], default: [] },
    statusHistory: { type: [statusEntrySchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

complaintSchema.index({ createdAt: -1 });
// Compound indexes serving the actual list queries (filter + sort by newest) so they never
// fall back to a collection scan + in-memory sort at scale.
complaintSchema.index({ citizenId: 1, createdAt: -1 }); // citizen "my complaints"
complaintSchema.index({ status: 1, createdAt: -1 }); // officer status filter
complaintSchema.index({ location: '2dsphere' });

export const Complaint = model('Complaint', complaintSchema);
