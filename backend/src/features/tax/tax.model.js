import mongoose from 'mongoose';
import { TAX_TYPES, PAYMENT_STATUSES } from '@dgp/shared';

const { Schema, model } = mongoose;

// Payments are embedded: bounded per record, no independent lifecycle, always read with
// the record → atomic append, no joins (blueprint: embed bounded sub-arrays).
const paymentSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    paidAt: { type: Date, default: Date.now },
    receiptNo: { type: String, trim: true },
    mode: { type: String, trim: true },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: true },
);

// Append-only change log. Never mutated after insert (SRS 3.2.4 transparency).
const historyEntrySchema = new Schema(
  {
    action: { type: String, required: true }, // create | update | payment
    field: { type: String },
    old: { type: Schema.Types.Mixed },
    new: { type: Schema.Types.Mixed },
    by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const taxRecordSchema = new Schema(
  {
    taxRecordId: { type: String, required: true, unique: true },
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    propertyNumber: { type: String, required: true, trim: true, index: true },
    taxType: { type: String, enum: TAX_TYPES, required: true, index: true },
    financialYear: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    balance: { type: Number, default: 0, min: 0 },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'Unpaid', index: true },
    dueDate: { type: Date },
    // Scanned tax bills (images/PDFs) uploaded by the officer; visible to the citizen.
    bills: {
      type: [
        new Schema(
          {
            url: { type: String, required: true },
            type: { type: String, enum: ['pdf', 'image'], required: true },
            name: { type: String },
            uploadedAt: { type: Date, default: Date.now },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    payments: { type: [paymentSchema], default: [] },
    history: { type: [historyEntrySchema], default: [] },
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

taxRecordSchema.index({ createdAt: -1 });
// Citizen "my taxes", newest first.
taxRecordSchema.index({ citizenId: 1, createdAt: -1 });

export const TaxRecord = model('TaxRecord', taxRecordSchema);
