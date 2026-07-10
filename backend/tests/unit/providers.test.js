import { env } from '../../src/config/env.js';
import { smsProvider } from '../../src/features/notifications/providers/sms.provider.js';
import { voiceProvider } from '../../src/features/notifications/providers/voice.provider.js';
import { emailProvider } from '../../src/features/notifications/providers/email.provider.js';
import { getProvider } from '../../src/features/notifications/providers/index.js';

const msg = { to: '9876543210', title: 'T', message: 'Hello' };

afterEach(() => {
  env.SMS_PROVIDER = 'mock';
  env.TWILIO_ACCOUNT_SID = undefined;
  env.TWILIO_AUTH_TOKEN = undefined;
  env.MSG91_API_KEY = undefined;
  env.EMAIL_PROVIDER = undefined;
});

describe('sms provider', () => {
  test('mock sends', async () => {
    env.SMS_PROVIDER = 'mock';
    const r = await smsProvider.send(msg);
    expect(r.status).toBe('sent');
    expect(r.providerMessageId).toMatch(/^mock-/);
  });

  test('twilio without credentials fails cleanly', async () => {
    env.SMS_PROVIDER = 'twilio';
    const r = await smsProvider.send(msg);
    expect(r.status).toBe('failed');
    expect(r.error).toMatch(/Twilio/);
  });

  test('twilio with credentials reports not-wired (no crash)', async () => {
    env.SMS_PROVIDER = 'twilio';
    env.TWILIO_ACCOUNT_SID = 'sid';
    env.TWILIO_AUTH_TOKEN = 'token';
    const r = await smsProvider.send(msg);
    expect(r.status).toBe('failed');
  });

  test('msg91 without credentials fails cleanly', async () => {
    env.SMS_PROVIDER = 'msg91';
    const r = await smsProvider.send(msg);
    expect(r.status).toBe('failed');
    expect(r.error).toMatch(/MSG91/);
  });

  test('unknown provider fails', async () => {
    env.SMS_PROVIDER = 'nope';
    const r = await smsProvider.send(msg);
    expect(r.status).toBe('failed');
    expect(r.error).toMatch(/Unknown/);
  });
});

describe('voice provider', () => {
  test('mock sends', async () => {
    env.SMS_PROVIDER = 'mock';
    const r = await voiceProvider.send(msg);
    expect(r.status).toBe('sent');
  });

  test('non-mock not wired', async () => {
    env.SMS_PROVIDER = 'twilio';
    const r = await voiceProvider.send(msg);
    expect(r.status).toBe('failed');
  });
});

describe('email provider', () => {
  test('skipped when unconfigured', async () => {
    env.EMAIL_PROVIDER = undefined;
    const r = await emailProvider.send(msg);
    expect(r.status).toBe('skipped');
  });

  test('sends when configured', async () => {
    env.EMAIL_PROVIDER = 'smtp';
    const r = await emailProvider.send(msg);
    expect(r.status).toBe('sent');
    expect(r.providerMessageId).toMatch(/^email-/);
  });
});

describe('provider registry', () => {
  test('resolves known channels and returns null for unknown', () => {
    expect(getProvider('sms')).toBe(smsProvider);
    expect(getProvider('voice')).toBe(voiceProvider);
    expect(getProvider('email')).toBe(emailProvider);
    expect(getProvider('inApp')).toBeNull();
  });
});
