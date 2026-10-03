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
  // Coverage scope: application logic only. Excludes the process bootstrap (server.js),
  // re-export barrels, and the JSDoc-only provider interface — none carry testable logic.
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/**/index.js',
    '!src/features/notifications/providers/provider.interface.js',
  ],
  coverageReporters: ['text-summary', 'text', 'lcov'],
  // Gate set just below current coverage (stmts 83 / branches 65 / funcs 82 / lines 87)
  // so the suite fails on a regression without being brittle to small refactors.
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 62,
      functions: 78,
      lines: 84,
    },
  },
};
