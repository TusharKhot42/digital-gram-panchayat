import mongoose from 'mongoose';
import { MEMBER_STATUSES, MEMBER_CATEGORIES } from '@dgp/shared';

const { Schema, model } = mongoose;

/**
 * Village Profile — the single public source of truth for the portal's landing page.
 *
 * This is a **singleton**: exactly one document per deployment (found/created via
 * `getOrCreate`). Storing it as one document (rather than scattered settings) means an
 * officer edits the whole profile in one place and any Gram Panchayat can re-brand the app
 * by editing data alone — no code change. Every field is optional with a sensible default so
 * the public GET works before an officer has filled anything in.
 *
 * Sub-lists (awards, gallery, videos, services, emergency contacts) are embedded arrays —
 * they are small, read together with the profile, and never queried independently.
 */
const awardSchema = new Schema(
  { name: String, year: String, description: String, image: String },
  { _id: true },
);

const galleryItemSchema = new Schema(
  { image: String, title: String, description: String, category: String, eventDate: Date },
  { _id: true },
);

const videoSchema = new Schema({ url: String, title: String, description: String }, { _id: true });

const serviceSchema = new Schema(
  { key: String, title: String, description: String, illustration: String, order: Number },
  { _id: true },
);

const emergencyContactSchema = new Schema({ label: String, phone: String }, { _id: true });

/**
 * A Gram Panchayat official / directory member. Richer than the flat `leadership` object (which
 * stays for backward compatibility): every field an official card needs, so the citizen
 * directory and the dashboard "Officials" section render from one editable list. All fields are
 * optional so a half-filled member still renders.
 */
const memberSchema = new Schema(
  {
    name: String,
    designation: String,
    ward: String,
    photo: String,
    mobile: String,
    officePhone: String,
    email: String,
    officeHours: String,
    officeAddress: String,
    responsibilities: String,
    termStart: Date,
    termEnd: Date,
    status: { type: String, enum: MEMBER_STATUSES, default: 'Active' },
    category: { type: String, enum: MEMBER_CATEGORIES, default: 'OfficeBearer' },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

const villageProfileSchema = new Schema(
  {
    // Singleton guard: always the string 'primary', unique — a second insert can't happen.
    key: { type: String, default: 'primary', unique: true, immutable: true },

    general: {
      villageName: { type: String, default: '' },
      panchayatName: { type: String, default: '' },
      logo: String,
      banner: String,
      description: { type: String, default: '' },
      history: { type: String, default: '' },
      vision: { type: String, default: '' },
      mission: { type: String, default: '' },
      taluka: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: 'Maharashtra' },
      pinCode: { type: String, default: '' },
      latitude: Number,
      longitude: Number,
      mapUrl: { type: String, default: '' },
    },

    // Free-form stat map: { area, population, families, literacyRate, schools, … }. Kept as a
    // Mixed object so the (long, evolving) statistics list needs no schema change to extend.
    statistics: { type: Schema.Types.Mixed, default: {} },

    leadership: {
      sarpanch: { type: String, default: '' },
      deputySarpanch: { type: String, default: '' },
      gramSevak: { type: String, default: '' },
      talathi: { type: String, default: '' },
      developmentOfficer: { type: String, default: '' },
      policePatil: { type: String, default: '' },
      contactNumbers: { type: String, default: '' },
      officeEmail: { type: String, default: '' },
      officeTimings: { type: String, default: '' },
    },

    awards: { type: [awardSchema], default: [] },
    gallery: { type: [galleryItemSchema], default: [] },
    videos: { type: [videoSchema], default: [] },
    services: { type: [serviceSchema], default: [] },
    emergencyContacts: { type: [emergencyContactSchema], default: [] },
    members: { type: [memberSchema], default: [] },

    social: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      telegram: { type: String, default: '' },
      website: { type: String, default: '' },
    },

    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
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

export const VillageProfile = model('VillageProfile', villageProfileSchema);
