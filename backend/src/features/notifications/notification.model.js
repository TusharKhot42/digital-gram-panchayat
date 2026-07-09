import mongoose from 'mongoose';
import { BROADCAST_CHANNELS, NotificationStatus, NotificationPurpose } from '@dgp/shared';

const { Schema, model } = mongoose;

/**
 * Log of every SMS/voice dispatch (blueprint 4 notifications). Written by the notification
 * service on every send — provides the delivery audit + retry surface (retry hardening M9).
 */
const notificationSchema = new Schema(
  {
    to: { type: String, required: true, index: true },
    channel: { type: String, enum: BROADCAST_CHANNELS, required: true },
    purpose: { type: String, enum: Object.values(NotificationPurpose), required: true },
    body: { type: String },
    providerMessageId: { type: String },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.Queued,
      index: true,
    },
    error: { type: String },
    relatedEntity: {
      kind: { type: String },
      id: { type: Schema.Types.ObjectId },
    },
    at: { type: Date, default: Date.now, index: true },
  },
  {
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

export const Notification = model('Notification', notificationSchema);
