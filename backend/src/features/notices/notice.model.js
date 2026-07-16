import mongoose from 'mongoose';
import { NOTICE_CATEGORIES, ATTACHMENT_TYPES, BROADCAST_CHANNELS } from '@dgp/shared';

const { Schema, model } = mongoose;

const broadcastSchema = new Schema(
  {
    sms: { type: Boolean, default: false },
    voice: { type: Boolean, default: false },
    summary: { type: String },
    dispatchedAt: { type: Date },
    recipientCount: { type: Number },
    channels: { type: [String], enum: BROADCAST_CHANNELS },
  },
  { _id: false },
);

const noticeSchema = new Schema(
  {
    noticeId: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    content: { type: String, required: true, trim: true },
    category: { type: String, enum: NOTICE_CATEGORIES, default: 'General', index: true },
    attachmentUrl: { type: String },
    attachmentType: { type: String, enum: ATTACHMENT_TYPES },
    publishDate: { type: Date },
    expiryDate: { type: Date },
    isPublished: { type: Boolean, default: false, index: true },
    // Auto-generated bilingual versions: { title:{en,mr}, summary:{en,mr}, content:{en,mr} }.
    // Original fields above stay the source of truth; citizens read i18n by selected language.
    i18n: { type: Schema.Types.Mixed },
    // Soft delete (blueprint: delete is soft, never hard).
    isActive: { type: Boolean, default: true, index: true },
    broadcast: { type: broadcastSchema },
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

noticeSchema.index({ createdAt: -1 });

export const Notice = model('Notice', noticeSchema);
