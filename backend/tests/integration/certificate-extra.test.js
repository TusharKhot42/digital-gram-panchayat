import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { ROLES } from '@dgp/shared';
import { createApp } from '../../src/app.js';
import { User } from '../../src/features/auth/user.model.js';
import { CertificateApplication } from '../../src/features/certificates/certificate.model.js';
import { hashPassword } from '../../src/utils/password.js';

let mongo;
let app;

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);
const DATA = {
  fullName: 'Test Citizen',
  mobile: '9876500002',
  address: '12 Main Road',
};

const DOCS = [
  { group: 'identity', docType: 'Aadhaar' },
  { group: 'address', docType: 'RationCard' },
  { group: 'selfDeclaration', docType: 'SelfDeclaration' },
];

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

afterEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    CertificateApplication.deleteMany({}),
    mongoose.connection.collection('counters').deleteMany({}),
    mongoose.connection.collection('notifications').deleteMany({}),
    mongoose.connection.collection('auditlogs').deleteMany({}),
  ]);
});

async function officerToken() {
  await User.create({
    role: ROLES.OFFICER,
    fullName: 'Officer',
    email: 'officer@dgp.local',
    passwordHash: await hashPassword('Admin@123'),
  });
  const res = await request(app)
    .post('/api/v1/admin/login')
    .send({ email: 'officer@dgp.local', password: 'Admin@123' });
  return res.body.data.token;
}

async function citizenToken(mobile = '9876500002') {
  const res = await request(app).post('/api/v1/auth/register').send({
    fullName: 'Test Citizen',
    mobile,
    password: 'Secret@123',
    village: 'Sakharale',
    address: 'Road',
  });
  return res.body.data.token;
}

async function apply(token) {
  const req = request(app)
    .post('/api/v1/dakhala')
    .set('Authorization', `Bearer ${token}`)
    .field('certificateType', 'Residence')
    .field('applicationData', JSON.stringify(DATA))
    .field('documentMeta', JSON.stringify(DOCS));
  DOCS.forEach((d, i) =>
    req.attach('documents', PNG, { filename: `${d.docType}-${i}.png`, contentType: 'image/png' }),
  );
  const res = await req;
  return res.body.data;
}

describe('all five certificate types accept a valid application', () => {
  const CASES = [
    {
      type: 'Birth',
      data: {
        childName: 'Baby Patil',
        dateOfBirth: '2024-01-01',
        placeOfBirth: 'Sakharale',
        fatherName: 'Ramesh',
        motherName: 'Sita',
      },
      docs: [
        { group: 'birthProof', docType: 'HospitalBirthReport' },
        { group: 'parentIdentity', docType: 'Aadhaar' },
        { group: 'parentAddress', docType: 'RationCard' },
      ],
    },
    {
      type: 'Death',
      data: {
        deceasedName: 'Late Patil',
        dateOfDeath: '2025-05-05',
        placeOfDeath: 'Sakharale',
        relationToApplicant: 'Son',
      },
      docs: [
        { group: 'deathProof', docType: 'DoctorDeathCertificate' },
        { group: 'deceasedIdentity', docType: 'Aadhaar' },
        { group: 'addressProof', docType: 'RationCard' },
        { group: 'applicantIdentity', docType: 'AadhaarOfRelative' },
      ],
    },
    {
      type: 'SevenTwelve',
      data: {
        surveyNumber: '123',
        gatNumber: '45',
        village: 'Sakharale',
        taluka: 'Walwa',
        district: 'Sangli',
      },
      docs: [
        { group: 'identity', docType: 'Aadhaar' },
        { group: 'landProof', docType: 'Existing712' },
      ],
    },
    {
      type: 'Other',
      data: { certificateTitle: 'No Dues', purpose: 'Bank loan', description: 'Need no-dues' },
      docs: [{ group: 'supporting', docType: 'Supporting' }],
    },
  ];

  test.each(CASES)(
    '$type application is accepted with its documents',
    async ({ type, data, docs }) => {
      const token = await citizenToken(); // each case runs against a clean DB (afterEach)
      const req = request(app)
        .post('/api/v1/dakhala')
        .set('Authorization', `Bearer ${token}`)
        .field('certificateType', type)
        .field('applicationData', JSON.stringify(data))
        .field('documentMeta', JSON.stringify(docs));
      docs.forEach((d, i) =>
        req.attach('documents', PNG, {
          filename: `${d.docType}-${i}.png`,
          contentType: 'image/png',
        }),
      );
      const res = await req;
      expect(res.status).toBe(201);
      expect(res.body.data.certificateType).toBe(type);
      expect(res.body.data.uploadedDocuments).toHaveLength(docs.length);
    },
  );
});

describe('officer review moves application to UnderReview', () => {
  test('review then citizen sees UnderReview', async () => {
    const oToken = await officerToken();
    const cToken = await citizenToken();
    const created = await apply(cToken);

    const review = await request(app)
      .patch(`/api/v1/admin/dakhala/${created.id}/review`)
      .set('Authorization', `Bearer ${oToken}`);
    expect(review.status).toBe(200);
    expect(review.body.data.status).toBe('UnderReview');

    const mine = await request(app)
      .get(`/api/v1/dakhala/${created.id}`)
      .set('Authorization', `Bearer ${cToken}`);
    expect(mine.body.data.status).toBe('UnderReview');
  });
});

describe('officer soft-delete', () => {
  test('deleted application disappears from the officer list', async () => {
    const oToken = await officerToken();
    const cToken = await citizenToken();
    const created = await apply(cToken);

    const del = await request(app)
      .delete(`/api/v1/admin/dakhala/${created.id}`)
      .set('Authorization', `Bearer ${oToken}`);
    expect(del.status).toBe(200);

    const list = await request(app)
      .get('/api/v1/admin/dakhala')
      .set('Authorization', `Bearer ${oToken}`);
    expect(list.body.data.data.find((a) => a.id === created.id)).toBeUndefined();
  });

  test('download before approval is rejected', async () => {
    const cToken = await citizenToken();
    const created = await apply(cToken);
    const res = await request(app)
      .get(`/api/v1/dakhala/${created.id}/certificate`)
      .set('Authorization', `Bearer ${cToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('CERTIFICATE_NOT_READY');
  });
});
