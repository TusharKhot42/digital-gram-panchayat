import mongoose from 'mongoose';
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TYPES,
  NOTIFICATION_STATUSES,
  NOTIFICATION_MODULES,
  NotificationPurpose,
} from '@dgp/shared';

const { Schema, model } = mongoose;

/**
 * One document per (recipient, event). Every notification is an in-app record the citizen
 * sees in the notification centre; `channels` lists the external dispatches attempted, and
 * `channel` is the primary external channel (kept singular for querying). `purpose` is
 * retained for cross-module logging compatibility.
 */
const notificationSchema = new Schema(
  {
    notificationId: { type: String, required: true, unique: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientRole: { type: String, enum: ['citizen', 'officer'], required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: NOTIFICATION_TYPES, default: 'info' },
    module: { type: String, enum: NOTIFICATION_MODULES, default: 'system', index: true },
    channel: { type: String, enum: NOTIFICATION_CHANNELS, default: 'inApp', index: true },
    channels: { type: [String], enum: NOTIFICATION_CHANNELS, default: ['inApp'] },
    purpose: { type: String, enum: Object.values(NotificationPurpose), required: true },
    // Set on every notification produced by a single broadcast, so the admin dashboard can
    // roll many per-recipient rows up into one entry. Absent for individual notifications.
    broadcastId: { type: String, index: true },
    // Auto-generated bilingual { title:{en,mr}, message:{en,mr} } so citizens read in their
    // language regardless of the language the officer authored the broadcast in.
    i18n: { type: Schema.Types.Mixed },
    entityId: { type: Schema.Types.ObjectId },
    to: { type: String }, // external destination (e.g. mobile) when dispatched off-platform
    status: {
      type: String,
      enum: NOTIFICATION_STATUSES,
      default: 'queued',
      index: true,
    },
    retryCount: { type: Number, default: 0 },
    providerMessageId: { type: String },
    error: { type: String },
    deliveredAt: { type: Date },
    readAt: { type: Date, index: true },
    metadata: { type: Schema.Types.Mixed },
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

notificationSchema.index({ recipientId: 1, readAt: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = model('Notification', notificationSchema);
