import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { ROLES } from '@dgp/shared';
import { createApp } from '../../src/app.js';
import { User } from '../../src/features/auth/user.model.js';
import { TaxRecord } from '../../src/features/tax/tax.model.js';
import { hashPassword } from '../../src/utils/password.js';

let mongo;
let app;

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
    TaxRecord.deleteMany({}),
    mongoose.connection.collection('counters').deleteMany({}),
    mongoose.connection.collection('notifications').deleteMany({}),
  ]);
});

async function officer() {
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

async function citizen(mobile = '9876500011') {
  const res = await request(app).post('/api/v1/auth/register').send({
    fullName: 'Ramesh',
    mobile,
    password: 'Secret@123',
    village: 'Sakharale',
    address: 'Road',
  });
  return { token: res.body.data.token, id: res.body.data.user.id, mobile };
}

async function makeRecord(token, citizenId, over = {}) {
  const res = await request(app)
    .post('/api/v1/admin/tax')
    .set('Authorization', `Bearer ${token}`)
    .send({
      citizenId,
      taxType: 'Property',
      financialYear: '2024-2025',
      amount: 5000,
      propertyNumber: 'PROP-1',
      ...over,
    });
  return res.body.data;
}

describe('officer tax lookup', () => {
  test('finds a citizen by mobile', async () => {
    const token = await officer();
    await citizen('9811110011');
    const res = await request(app)
      .get('/api/v1/admin/tax/lookup?mobile=9811110011')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.mobile).toBe('9811110011');
    expect(res.body.data.fullName).toBe('Ramesh');
  });

  test('unknown mobile -> 404', async () => {
    const token = await officer();
    const res = await request(app)
      .get('/api/v1/admin/tax/lookup?mobile=9700000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('CITIZEN_NOT_FOUND');
  });
});

describe('officer tax admin list + detail', () => {
  test('lists with filters and returns detail', async () => {
    const token = await officer();
    const c = await citizen('9811110012');
    const created = await makeRecord(token, c.id);

    const list = await request(app)
      .get('/api/v1/admin/tax?taxType=Property&paymentStatus=Unpaid&q=PROP-1&page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.data.total).toBe(1);
    expect(list.body.data.data[0].taxRecordId).toBe(created.taxRecordId);

    const detail = await request(app)
      .get(`/api/v1/admin/tax/${created.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.id).toBe(created.id);
  });

  test('history endpoint 404 for unknown id', async () => {
    const token = await officer();
    const res = await request(app)
      .get(`/api/v1/admin/tax/${new mongoose.Types.ObjectId()}/history`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
