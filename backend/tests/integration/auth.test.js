import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { ROLES } from '@dgp/shared';
import { createApp } from '../../src/app.js';
import { User } from '../../src/features/auth/user.model.js';
import { hashPassword } from '../../src/utils/password.js';

let mongo;
let app;

const validCitizen = {
  fullName: 'Test Citizen',
  mobile: '9876543210',
  password: 'Secret@123',
  village: 'Sakharale',
  address: 'House 12, Main Road',
};

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
  await User.deleteMany({});
});

async function seedOfficer() {
  const passwordHash = await hashPassword('Admin@123');
  return User.create({
    role: ROLES.OFFICER,
    fullName: 'Officer One',
    email: 'officer@dgp.local',
    passwordHash,
  });
}

describe('POST /api/v1/auth/register', () => {
  test('registers a citizen and returns a token + sanitized user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validCitizen);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.mobile).toBe(validCitizen.mobile);
    expect(res.body.data.user.role).toBe(ROLES.CITIZEN);
    // password must never be exposed
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  test('rejects duplicate mobile with 409', async () => {
    await request(app).post('/api/v1/auth/register').send(validCitizen);
    const res = await request(app).post('/api/v1/auth/register').send(validCitizen);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('rejects invalid mobile with 400 validation error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validCitizen, mobile: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.fields.mobile).toBeDefined();
  });

  test('stored password is hashed, not plaintext', async () => {
    await request(app).post('/api/v1/auth/register').send(validCitizen);
    const doc = await User.findOne({ mobile: validCitizen.mobile }).select('+passwordHash');
    expect(doc.passwordHash).toBeDefined();
    expect(doc.passwordHash).not.toBe(validCitizen.password);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send(validCitizen);
  });

  test('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ mobile: validCitizen.mobile, password: validCitizen.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test('rejects wrong password with 401 (no enumeration)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ mobile: validCitizen.mobile, password: 'WrongPass1' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('rejects unknown mobile with same 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ mobile: '9000000000', password: 'whatever1' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('protected routes', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validCitizen);
    token = res.body.data.token;
  });

  test('GET /auth/profile returns the user with a valid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.mobile).toBe(validCitizen.mobile);
  });

  test('rejects missing token with 401', async () => {
    const res = await request(app).get('/api/v1/auth/profile');
    expect(res.status).toBe(401);
  });

  test('rejects an expired token with 401', async () => {
    const doc = await User.findOne({ mobile: validCitizen.mobile });
    const expired = jwt.sign({ role: ROLES.CITIZEN }, process.env.JWT_SECRET, {
      subject: String(doc.id),
      expiresIn: '-1s',
    });
    const res = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  test('citizen token is forbidden on officer-only route (403)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('PUT /auth/profile updates editable fields', async () => {
    const res = await request(app)
      .put('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Renamed Citizen', village: 'New Village', address: 'New Address 5' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.fullName).toBe('Renamed Citizen');
    expect(res.body.data.user.village).toBe('New Village');
  });
});

describe('POST /api/v1/admin/login', () => {
  beforeEach(seedOfficer);

  test('officer logs in with email + password', async () => {
    const res = await request(app)
      .post('/api/v1/admin/login')
      .send({ email: 'officer@dgp.local', password: 'Admin@123' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe(ROLES.OFFICER);
  });

  test('officer token reaches officer profile', async () => {
    const login = await request(app)
      .post('/api/v1/admin/login')
      .send({ email: 'officer@dgp.local', password: 'Admin@123' });
    const res = await request(app)
      .get('/api/v1/admin/profile')
      .set('Authorization', `Bearer ${login.body.data.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('officer@dgp.local');
  });

  test('rejects wrong officer password with 401', async () => {
    const res = await request(app)
      .post('/api/v1/admin/login')
      .send({ email: 'officer@dgp.local', password: 'nope' });
    expect(res.status).toBe(401);
  });
});
