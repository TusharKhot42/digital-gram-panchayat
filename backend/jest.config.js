export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  // setupFiles run before any test module is imported — needed so required env vars
  // exist before config/env.js validates them at import time.
  setupFiles: ['<rootDir>/tests/setup-env.js'],
  // Native ESM — no Babel transform. Runner is invoked with --experimental-vm-modules.
  transform: {},
  clearMocks: true,
  verbose: true,
  testTimeout: 60000,
};
