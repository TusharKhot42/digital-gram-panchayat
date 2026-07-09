// Runs before any test module imports config/env.js. Provides the vars env validation
// requires so import-time validation passes. The real DB URI is unused — integration
// tests connect mongoose to an in-memory MongoDB instead.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-value-at-least-32-characters-long-000';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/dgp_test_placeholder';
process.env.SMS_PROVIDER = 'mock';
process.env.LOG_LEVEL = 'error';
