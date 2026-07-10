import mongoose from 'mongoose';
import { CERT_TYPES, DAKHALA_STATUSES } from '@dgp/shared';

const { Schema, model } = mongoose;

const documentSchema = new Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'image'], required: true },
    name: { type: String },
  },
  { _id: false },
);

// Append-only status trail.
const statusEntrySchema = new Schema(
  {
    status: { type: String, enum: DAKHALA_STATUSES, required: true },
    by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const certificateSchema = new Schema(
  {
    applicationId: { type: String, required: true, unique: true },
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    certificateType: { type: String, enum: CERT_TYPES, required: true, index: true },
    applicationData: { type: Schema.Types.Mixed, default: {} },
    uploadedDocuments: { type: [documentSchema], default: [] },
    status: { type: String, enum: DAKHALA_STATUSES, default: 'Submitted', index: true },
    rejectionReason: { type: String },
    pdfUrl: { type: String },
    history: { type: [statusEntrySchema], default: [] },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    // Internal soft delete only — never exposed to citizens.
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
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

certificateSchema.index({ createdAt: -1 });

export const CertificateApplication = model('CertificateApplication', certificateSchema);
