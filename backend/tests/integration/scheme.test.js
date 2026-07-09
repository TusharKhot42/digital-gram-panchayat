import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { ROLES } from '@dgp/shared';
import { createApp } from '../../src/app.js';
import { User } from '../../src/features/auth/user.model.js';
import { Scheme } from '../../src/features/schemes/scheme.model.js';
import { AuditLog } from '../../src/features/audit/audit.model.js';
import { hashPassword } from '../../src/utils/password.js';

let mongo;
let app;

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

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
    Scheme.deleteMany({}),
    AuditLog.deleteMany({}),
    mongoose.connection.collection('counters').deleteMany({}),
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

async function citizenToken(mobile = '9876500001') {
  const res = await request(app).post('/api/v1/auth/register').send({
    fullName: 'Citizen',
    mobile,
    password: 'Secret@123',
    village: 'Sakharale',
    address: 'Road',
  });
  return res.body.data.token;
}

function createScheme(token, overrides = {}) {
  const req = request(app)
    .post('/api/v1/admin/schemes')
    .set('Authorization', `Bearer ${token}`)
    .field('title', overrides.title || 'PM Awas Yojana')
    .field('description', overrides.description || 'Housing subsidy for rural families')
    .field('category', overrides.category || 'Housing')
    .field('officialWebsite', overrides.officialWebsite || 'https://pmaymis.gov.in');
  if (overrides.summary) req.field('summary', overrides.summary);
  return req;
}

describe('officer scheme CRUD', () => {
  test('creates a scheme with an SCH id', async () => {
    const token = await officerToken();
    const res = await createScheme(token, { summary: 'Rural housing' });
    expect(res.status).toBe(201);
    expect(res.body.data.schemeId).toMatch(/^SCH-\d{4}-\d{6}$/);
    expect(res.body.data.isPublished).toBe(false);
    expect(res.body.data.isActive).toBe(true);
    expect(res.body.data.officialWebsite).toBe('https://pmaymis.gov.in');
  });

  test('accepts an optional image', async () => {
    const token = await officerToken();
    const res = await request(app)
      .post('/api/v1/admin/schemes')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Scheme with image')
      .field('description', 'Has a banner image')
      .attach('image', PNG, { filename: 's.png', contentType: 'image/png' });
    expect(res.status).toBe(201);
    expect(res.body.data.imageUrl).toBeDefined();
  });

  test('parses requiredDocuments from newline string', async () => {
    const token = await officerToken();
    const res = await request(app)
      .post('/api/v1/admin/schemes')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Docs scheme')
      .field('description', 'Needs documents')
      .field('requiredDocuments', 'Aadhaar\nRation card\nIncome certificate');
    expect(res.status).toBe(201);
    expect(res.body.data.requiredDocuments).toEqual([
      'Aadhaar',
      'Ration card',
      'Income certificate',
    ]);
  });

  test('rejects an invalid official website (400)', async () => {
    const token = await officerToken();
    const res = await request(app)
      .post('/api/v1/admin/schemes')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Bad url scheme')
      .field('description', 'Invalid website')
      .field('officialWebsite', 'not-a-url');
    expect(res.status).toBe(400);
    expect(res.body.error.fields.officialWebsite).toBeDefined();
  });

  test('rejects missing title (400)', async () => {
    const token = await officerToken();
    const res = await request(app)
      .post('/api/v1/admin/schemes')
      .set('Authorization', `Bearer ${token}`)
      .field('description', 'No title');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('updates a scheme', async () => {
    const token = await officerToken();
    const created = await createScheme(token);
    const res = await request(app)
      .put(`/api/v1/admin/schemes/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'PM Awas Yojana (Gramin)');
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('PM Awas Yojana (Gramin)');
  });

  test('publishes then unpublishes', async () => {
    const token = await officerToken();
    const created = await createScheme(token);
    const id = created.body.data.id;

    const pub = await request(app)
      .patch(`/api/v1/admin/schemes/${id}/publish`)
      .set('Authorization', `Bearer ${token}`);
    expect(pub.body.data.isPublished).toBe(true);
    expect(pub.body.data.publishDate).toBeDefined();

    const unpub = await request(app)
      .patch(`/api/v1/admin/schemes/${id}/unpublish`)
      .set('Authorization', `Bearer ${token}`);
    expect(unpub.body.data.isPublished).toBe(false);
  });

  test('soft-deletes a scheme', async () => {
    const token = await officerToken();
    const created = await createScheme(token);
    const id = created.body.data.id;

    const res = await request(app)
      .delete(`/api/v1/admin/schemes/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const doc = await Scheme.findById(id);
    expect(doc.isActive).toBe(false);

    const list = await request(app)
      .get('/api/v1/admin/schemes')
      .set('Authorization', `Bearer ${token}`);
    expect(list.body.data.total).toBe(0);
  });

  test('audits create / update / publish / unpublish / delete', async () => {
    const token = await officerToken();
    const created = await createScheme(token);
    const id = created.body.data.id;
    await request(app)
      .put(`/api/v1/admin/schemes/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .field('summary', 'Updated');
    await request(app)
      .patch(`/api/v1/admin/schemes/${id}/publish`)
      .set('Authorization', `Bearer ${token}`);
    await request(app)
      .patch(`/api/v1/admin/schemes/${id}/unpublish`)
      .set('Authorization', `Bearer ${token}`);
    await request(app)
      .delete(`/api/v1/admin/schemes/${id}`)
      .set('Authorization', `Bearer ${token}`);

    const actions = [
      'scheme.create',
      'scheme.update',
      'scheme.publish',
      'scheme.unpublish',
      'scheme.delete',
    ];
    const counts = await Promise.all(actions.map((action) => AuditLog.countDocuments({ action })));
    counts.forEach((count) => expect(count).toBe(1));
  });
});

describe('authorization', () => {
  test('citizen cannot create a scheme (403)', async () => {
    const token = await citizenToken();
    const res = await request(app)
      .post('/api/v1/admin/schemes')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Nope')
      .field('description', 'Citizen cannot');
    expect(res.status).toBe(403);
  });

  test('no token cannot list admin schemes (401)', async () => {
    const res = await request(app).get('/api/v1/admin/schemes');
    expect(res.status).toBe(401);
  });
});

describe('public browse', () => {
  test('only published schemes are public; search + category filter work', async () => {
    const token = await officerToken();
    await createScheme(token, { title: 'Draft scheme' }); // stays draft
    const published = await createScheme(token, {
      title: 'Kisan Credit Card',
      category: 'Agriculture',
    });
    await request(app)
      .patch(`/api/v1/admin/schemes/${published.body.data.id}/publish`)
      .set('Authorization', `Bearer ${token}`);

    const list = await request(app).get('/api/v1/schemes');
    expect(list.status).toBe(200);
    expect(list.body.data.total).toBe(1);
    expect(list.body.data.data[0].title).toBe('Kisan Credit Card');

    const search = await request(app).get('/api/v1/schemes?q=kisan');
    expect(search.body.data.total).toBe(1);

    const cat = await request(app).get('/api/v1/schemes?category=Agriculture');
    expect(cat.body.data.total).toBe(1);
    const miss = await request(app).get('/api/v1/schemes?category=Health');
    expect(miss.body.data.total).toBe(0);
  });

  test('public detail 404 for a draft scheme', async () => {
    const token = await officerToken();
    const draft = await createScheme(token);
    const res = await request(app).get(`/api/v1/schemes/${draft.body.data.id}`);
    expect(res.status).toBe(404);
  });
});
