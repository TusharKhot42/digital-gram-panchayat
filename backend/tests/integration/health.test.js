import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../../src/app.js';

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

describe('health / liveness / readiness / metrics', () => {
  test('GET /health reports ok + db connected', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.db).toBe('connected');
  });

  test('GET /health/live is always alive', async () => {
    const res = await request(app).get('/api/v1/health/live');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('alive');
  });

  test('GET /health/ready returns 200 when the DB is connected', async () => {
    const res = await request(app).get('/api/v1/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ready');
  });

  test('GET /health/metrics returns Prometheus text with request counters', async () => {
    // Generate at least one request so the counter is non-zero.
    await request(app).get('/api/v1/health');
    const res = await request(app).get('/api/v1/health/metrics');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toMatch(/dgp_http_requests_total/);
    expect(res.text).toMatch(/dgp_http_request_duration_ms_bucket/);
  });

  test('readiness returns 503 when the DB is disconnected', async () => {
    await mongoose.disconnect();
    const res = await request(app).get('/api/v1/health/ready');
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('NOT_READY');
    await mongoose.connect(mongo.getUri()); // restore for afterAll
  });
});
