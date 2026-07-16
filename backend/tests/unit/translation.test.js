import {
  detectLanguage,
  translateToBoth,
  translateFields,
} from '../../src/features/translation/translation.service.js';

describe('language detection', () => {
  test('Devanagari is detected as Marathi, Latin as English', () => {
    expect(detectLanguage('पाणीपुरवठा बंद')).toBe('mr');
    expect(detectLanguage('Water supply cut')).toBe('en');
    expect(detectLanguage('')).toBe('en');
  });
});

describe('translateToBoth (mock provider)', () => {
  test('English source keeps original + produces a Marathi version', async () => {
    const r = await translateToBoth('Water supply cut');
    expect(r.source).toBe('en');
    expect(r.en).toBe('Water supply cut');
    expect(r.mr).toContain('Water supply cut');
    expect(r.mr).not.toBe(r.en); // a distinct translated value
  });

  test('Marathi source is detected and English generated', async () => {
    const r = await translateToBoth('पाणीपुरवठा बंद');
    expect(r.source).toBe('mr');
    expect(r.mr).toBe('पाणीपुरवठा बंद');
    expect(r.en).toContain('पाणीपुरवठा बंद');
  });

  test('explicit source language overrides detection', async () => {
    const r = await translateToBoth('Namaste', 'mr');
    expect(r.source).toBe('mr');
    expect(r.mr).toBe('Namaste');
  });

  test('empty input yields empty versions', async () => {
    const r = await translateToBoth('   ');
    expect(r.en).toBe('');
    expect(r.mr).toBe('');
  });
});

describe('translateFields', () => {
  test('builds { field: { en, mr } } and skips empty fields', async () => {
    const out = await translateFields({ title: 'Hello', summary: '', content: 'Body' });
    expect(out.title).toEqual({ en: 'Hello', mr: expect.stringContaining('Hello') });
    expect(out.content).toBeDefined();
    expect(out.summary).toBeUndefined();
  });
});
