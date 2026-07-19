import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end config for the Digital Gram Panchayat citizen PWA + officer portal.
 *
 * Prerequisites to run (`npm run e2e`):
 *   1. MongoDB running locally (mongodb://127.0.0.1:27017).
 *   2. Backend seeded with an officer: `npm run seed:admin -w backend`.
 *   3. The three dev servers up: `npm run dev` (backend :5000, citizen :5173, admin :5174).
 *
 * These specs describe complete user journeys; they are environment-gated (real servers +
 * DB) and therefore run on demand rather than in the default `npm test` pipeline.
 */
const CITIZEN_URL = process.env.E2E_CITIZEN_URL || 'http://localhost:5173';
const ADMIN_URL = process.env.E2E_ADMIN_URL || 'http://localhost:5174';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/report' }]],
  // In CI, boot the full stack; locally, reuse whatever the developer already has running.
  // Backend env (MONGODB_URI, JWT_SECRET) is provided by the CI job.
  webServer: process.env.CI
    ? [
        {
          command: 'npm run dev:server',
          url: 'http://localhost:5000/api/v1/health',
          timeout: 60_000,
          reuseExistingServer: false,
        },
        {
          command: 'npm run dev:citizen',
          url: CITIZEN_URL,
          timeout: 60_000,
          reuseExistingServer: false,
        },
        {
          command: 'npm run dev:admin',
          url: ADMIN_URL,
          timeout: 60_000,
          reuseExistingServer: false,
        },
      ]
    : undefined,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'citizen',
      testMatch: /citizen\..*\.spec\.js/,
      use: { ...devices['Pixel 7'], baseURL: CITIZEN_URL },
    },
    {
      name: 'admin',
      testMatch: /admin\..*\.spec\.js/,
      use: { ...devices['Desktop Chrome'], baseURL: ADMIN_URL },
    },
  ],
});
