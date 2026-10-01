import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { ROLES } from '@dgp/shared';
import { createApp } from '../../src/app.js';
import { User } from '../../src/features/auth/user.model.js';
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
  await User.deleteMany({});
});

async function seedRootOfficer() {
  const passwordHash = await hashPassword('Admin@123');
  return User.create({
    role: ROLES.OFFICER,
    fullName: 'Root Officer',
    email: 'admin@dgp.local',
    passwordHash,
    isRootAdmin: true,
  });
}

describe('Admin Registration & Multi-Admin Management', () => {
  test('Root admin can register a new verified administrator', async () => {
    await seedRootOfficer();

    // Login as root admin
    const loginRes = await request(app).post('/api/v1/admin/login').send({
      email: 'admin@dgp.local',
      password: 'Admin@123',
    });
    expect(loginRes.status).toBe(200);
    const rootToken = loginRes.body.data.token;
    expect(loginRes.body.data.user.isRootAdmin).toBe(true);

    // Root admin registers new admin
    const newAdminPayload = {
      fullName: 'New Assistant Officer',
      email: 'assistant@dgp.local',
      password: 'Password@123',
      mobile: '9822112233',
      village: 'Sakharale',
    };
    const regRes = await request(app)
      .post('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${rootToken}`)
      .send(newAdminPayload);

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.user.email).toBe('assistant@dgp.local');
    expect(regRes.body.data.user.isRootAdmin).toBe(false);
    expect(regRes.body.data.user.isActive).toBe(true);
    expect(regRes.body.data.user.passwordHash).toBeUndefined();

    // New admin can log in immediately
    const newAdminLogin = await request(app).post('/api/v1/admin/login').send({
      email: 'assistant@dgp.local',
      password: 'Password@123',
    });
    expect(newAdminLogin.status).toBe(200);
    expect(newAdminLogin.body.data.user.isRootAdmin).toBe(false);

    const newAdminToken = newAdminLogin.body.data.token;

    // Non-root admin CANNOT register another admin (403 FORBIDDEN)
    const unauthorizedReg = await request(app)
      .post('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${newAdminToken}`)
      .send({
        fullName: 'Another Admin',
        email: 'another@dgp.local',
        password: 'Password@123',
      });
    expect(unauthorizedReg.status).toBe(403);

    // List admins
    const listRes = await request(app)
      .get('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${rootToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.data.length).toBe(2);

    // Non-root admin cannot deactivate root admin
    const rootUser = await User.findOne({ email: 'admin@dgp.local' });
    const deactRootRes = await request(app)
      .patch(`/api/v1/admin/users/${rootUser.id}/status`)
      .set('Authorization', `Bearer ${newAdminToken}`)
      .send({ status: 'inactive' });
    expect(deactRootRes.status).toBe(400);

    // Non-root admin cannot deactivate other admin
    const deactOtherRes = await request(app)
      .patch(`/api/v1/admin/users/${newAdminLogin.body.data.user.id}/status`)
      .set('Authorization', `Bearer ${newAdminToken}`)
      .send({ status: 'inactive' });
    expect(deactOtherRes.status).toBe(400); // self-deactivation rejected

    // Root admin can deactivate non-root admin
    const deactByRoot = await request(app)
      .patch(`/api/v1/admin/users/${newAdminLogin.body.data.user.id}/status`)
      .set('Authorization', `Bearer ${rootToken}`)
      .send({ status: 'inactive' });
    expect(deactByRoot.status).toBe(200);
    expect(deactByRoot.body.data.isActive).toBe(false);
  });

  test('Rejects duplicate email or mobile for new admin', async () => {
    await seedRootOfficer();
    const loginRes = await request(app).post('/api/v1/admin/login').send({
      email: 'admin@dgp.local',
      password: 'Admin@123',
    });
    const rootToken = loginRes.body.data.token;

    // First admin registration
    await request(app)
      .post('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${rootToken}`)
      .send({
        fullName: 'Admin Two',
        email: 'two@dgp.local',
        password: 'Password@123',
        mobile: '9811223344',
      });

    // Try duplicate email
    const dupEmailRes = await request(app)
      .post('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${rootToken}`)
      .send({
        fullName: 'Admin Three',
        email: 'two@dgp.local',
        password: 'Password@123',
      });
    expect(dupEmailRes.status).toBe(409);

    // Try duplicate mobile
    const dupMobileRes = await request(app)
      .post('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${rootToken}`)
      .send({
        fullName: 'Admin Four',
        email: 'four@dgp.local',
        password: 'Password@123',
        mobile: '9811223344',
      });
    expect(dupMobileRes.status).toBe(409);
  });
});
