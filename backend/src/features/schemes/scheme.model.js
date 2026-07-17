import mongoose from 'mongoose';
import { SCHEME_CATEGORIES } from '@dgp/shared';

const { Schema, model } = mongoose;

const schemeSchema = new Schema(
  {
    schemeId: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: SCHEME_CATEGORIES, default: 'Other', index: true },
    eligibility: { type: String, trim: true },
    requiredDocuments: { type: [String], default: [] },
    benefits: { type: String, trim: true },
    applicationProcess: { type: String, trim: true },
    officialWebsite: { type: String, trim: true },
    imageUrl: { type: String },
    // Original fields above stay the source of truth; citizens read i18n by selected language.
    // Absent on older documents — pickLocale() falls back to the plain field.
    i18n: { type: Schema.Types.Mixed },
    // Optional supporting files (PDF forms, circulars) — additive, absent on older docs.
    // NB: `type` must be declared as `{ type: String }` or mongoose reads it as the
    // array's type declaration ("Cast to [string] failed").
    attachments: {
      type: [{ url: String, type: { type: String }, name: String, _id: false }],
      default: [],
    },
    publishDate: { type: Date },
    expiryDate: { type: Date },
    isPublished: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

schemeSchema.index({ createdAt: -1 });
// Text index for keyword search (blueprint 5.4). Regex search is used as the primary
// path; this supports future $text queries without a migration.
schemeSchema.index({ title: 'text', summary: 'text', description: 'text' });

export const Scheme = model('Scheme', schemeSchema);
