import { jest } from '@jest/globals';

// Unit-test the startup diagnostics summary + production warnings without booting a server.
// We stub the logger and toggle env/cloudinary via module mocks.
describe('startup diagnostics', () => {
  const ORIG = { ...process.env };
  afterEach(() => {
    process.env = { ...ORIG };
    jest.resetModules();
  });

  async function load({ nodeEnv = 'production', cloudinary = false } = {}) {
    jest.resetModules();
    const info = [];
    const warn = [];
    jest.unstable_mockModule('../../src/utils/logger.js', () => ({
      logger: {
        info: (msg, ctx) => info.push({ msg, ctx }),
        warn: (msg, ctx) => warn.push({ msg, ctx }),
        error: () => {},
        debug: () => {},
      },
    }));
    jest.unstable_mockModule('../../src/config/cloudinary.js', () => ({
      isCloudinaryConfigured: cloudinary,
      cloudinary: {},
    }));
    jest.unstable_mockModule('../../src/config/env.js', () => ({
      env: {
        NODE_ENV: nodeEnv,
        API_VERSION: 'v1',
        SMS_PROVIDER: 'mock',
        TRANSLATION_PROVIDER: 'mock',
        EMAIL_PROVIDER: undefined,
        CORS_ORIGIN_CITIZEN: 'https://citizen.example',
        CORS_ORIGIN_ADMIN: 'https://admin.example',
      },
    }));
    const { logStartupDiagnostics } = await import('../../src/config/diagnostics.js');
    logStartupDiagnostics();
    return { info, warn };
  }

  test('always logs a config summary', async () => {
    const { info } = await load({ nodeEnv: 'development' });
    expect(info.some((e) => e.msg === 'Configuration summary')).toBe(true);
  });

  test('warns in production when uploads/SMS/translation are on fallbacks', async () => {
    const { warn } = await load({ nodeEnv: 'production', cloudinary: false });
    const text = warn.map((w) => w.ctx.warning).join(' | ');
    expect(text).toMatch(/LOCAL disk fallback/);
    expect(text).toMatch(/SMS_PROVIDER=mock/);
    expect(text).toMatch(/TRANSLATION_PROVIDER=mock/);
  });

  test('no production warnings in development', async () => {
    const { warn } = await load({ nodeEnv: 'development' });
    expect(warn).toHaveLength(0);
  });
});
