import mongoose from 'mongoose';
import { DOWNLOAD_CATEGORIES } from '@dgp/shared';

const { Schema, model } = mongoose;

export { DOWNLOAD_CATEGORIES };

/**
 * A document the Gram Panchayat publishes: forms, circulars, maps, budgets, annual and
 * development reports.
 *
 * `downloadCount` is INDICATIVE ONLY. The endpoint that increments it is public, because
 * requiring a login to read a published circular would defeat the point of publishing it — so
 * the number can never be trustworthy. A rate limiter stops it being rewritten by a loop, but
 * it is not per-citizen and it is not an audit trail. An officer wanting to know *who* took a
 * copy must use the audit log. Treat it as "roughly how wanted is this form", nothing more.
 */
const downloadSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, enum: DOWNLOAD_CATEGORIES, default: 'Other', index: true },

    fileUrl: { type: String, required: true },
    fileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0, min: 0 },
    fileType: { type: String, default: '' },

    year: { type: String, default: '' },
    downloadCount: { type: Number, default: 0, min: 0 },

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

downloadSchema.index({ isActive: 1, isPublished: 1, category: 1, createdAt: -1 });

export const DownloadDoc = model('DownloadDoc', downloadSchema);
