import {
  answerQuestion,
  rankTopics,
  suggestedTopics,
  detectLanguage,
  tokenize,
  normalize,
  expand,
  CONFIDENCE,
} from '@dgp/shared';

/**
 * The assistant selects an authored topic; it never composes an answer. These tests therefore
 * guard two properties above all: it routes real questions to the RIGHT guide, and when it is
 * unsure it says so instead of guessing — because a confident wrong answer about certificate
 * documents sends a citizen to the office with the wrong papers.
 */

describe('normalize / tokenize / language detection', () => {
  it('strips punctuation and case but keeps Devanagari', () => {
    expect(normalize('How do I FILE a complaint?')).toBe('how do i file a complaint');
    expect(normalize('तक्रार कशी नोंदवावी?')).toBe('तक्रार कशी नोंदवावी');
  });

  it('drops stopwords and single characters', () => {
    expect(tokenize('how do i file a complaint')).toEqual(['file', 'complaint']);
  });

  it('detects Marathi from Devanagari, English otherwise', () => {
    expect(detectLanguage('तक्रार')).toBe('mr');
    expect(detectLanguage('complaint')).toBe('en');
    expect(detectLanguage('')).toBe('en');
  });

  it('expands synonyms across languages', () => {
    expect(expand(['dakhala'])).toContain('certificate');
    expect(expand(['तक्रार'])).toContain('complaint');
    expect(expand(['satbara'])).toContain('7/12');
  });
});

describe('answering real questions (English)', () => {
  const ask = (q) => answerQuestion(q, { audience: 'citizen' });

  it('routes a complaint question to the complaint guide', () => {
    const r = ask('how do I file a complaint');
    expect(r.kind).toBe('answer');
    expect(r.topic.id).toBe('file-complaint');
  });

  it('routes a birth certificate question to the birth guide, not another certificate', () => {
    const r = ask('birth certificate');
    expect(r.kind).toBe('answer');
    expect(r.topic.id).toBe('apply-birth');
  });

  it('routes a tax question to the tax guide', () => {
    const r = ask('check my tax dues');
    expect(['answer', 'clarify']).toContain(r.kind);
    const ids = r.kind === 'answer' ? [r.topic.id] : r.topics.map((t) => t.id);
    expect(ids).toContain('view-tax');
  });

  it('routes a QR question to the verification guide', () => {
    const r = ask('verify certificate qr code');
    const ids = r.kind === 'answer' ? [r.topic.id] : r.topics.map((t) => t.id);
    expect(ids).toContain('verify-certificate');
  });

  it('routes a password question to the forgot-password guide', () => {
    const r = ask('forgot password');
    const ids = r.kind === 'answer' ? [r.topic.id] : r.topics.map((t) => t.id);
    expect(ids).toContain('forgot-password');
  });
});

describe('answering real questions (Marathi)', () => {
  const ask = (q) => answerQuestion(q, { audience: 'citizen' });

  it('answers a Marathi complaint question', () => {
    const r = ask('तक्रार कशी नोंदवावी');
    expect(r.lang).toBe('mr');
    const ids = r.kind === 'answer' ? [r.topic.id] : r.topics.map((t) => t.id);
    expect(ids).toContain('file-complaint');
  });

  it('answers a Marathi certificate question', () => {
    const r = ask('दाखला');
    const ids = r.kind === 'answer' ? [r.topic.id] : (r.topics || []).map((t) => t.id);
    expect(ids.some((id) => id.startsWith('apply-') || id === 'certificates-overview')).toBe(true);
  });

  it('answers a Marathi tax question', () => {
    const r = ask('कर');
    const ids = r.kind === 'answer' ? [r.topic.id] : (r.topics || []).map((t) => t.id);
    expect(ids).toContain('view-tax');
  });
});

describe('never inventing an answer', () => {
  it('falls back when nothing matches at all', () => {
    const r = answerQuestion('zzzz qwerty nonsense', { audience: 'citizen' });
    expect(r.kind).toBe('fallback');
    expect(r.topic).toBeUndefined();
  });

  it('falls back on an empty question', () => {
    expect(answerQuestion('', { audience: 'citizen' }).kind).toBe('fallback');
    expect(answerQuestion('   ', { audience: 'citizen' }).kind).toBe('fallback');
  });

  it('asks to clarify instead of guessing on a weak, ambiguous match', () => {
    // Vague phrasing that glances off several guides without identifying any one of them.
    const r = answerQuestion('i have a question', { audience: 'citizen' });
    expect(r.kind).toBe('clarify');
    expect(r.topics.length).toBeGreaterThan(0);
    expect(r.topic).toBeUndefined();
  });

  it('only answers outright above the HIGH confidence threshold', () => {
    const ranked = rankTopics('how do I file a complaint', { audience: 'citizen' });
    expect(ranked[0].confidence).toBeGreaterThanOrEqual(CONFIDENCE.HIGH);
  });

  it('confidence is always a sane 0..1 value', () => {
    rankTopics('certificate tax complaint notice', { audience: 'citizen' }).forEach((r) => {
      expect(r.confidence).toBeGreaterThan(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    });
  });
});

describe('audience isolation', () => {
  it('never offers an officer guide to a citizen', () => {
    const r = answerQuestion('approve a certificate', { audience: 'citizen' });
    const ids = r.kind === 'answer' ? [r.topic.id] : (r.topics || []).map((t) => t.id);
    expect(ids.some((id) => id.startsWith('officer-'))).toBe(false);
  });

  it('routes an officer question to the officer guide', () => {
    const r = answerQuestion('approve and issue a certificate', { audience: 'officer' });
    const ids = r.kind === 'answer' ? [r.topic.id] : (r.topics || []).map((t) => t.id);
    expect(ids).toContain('officer-certificates');
  });
});

describe('context-aware suggestions', () => {
  it('puts topics for the current screen first', () => {
    const s = suggestedTopics({ audience: 'citizen', route: '/tax' });
    expect(s[0].route).toBe('/tax');
  });

  it('returns suggestions even with no route', () => {
    expect(suggestedTopics({ audience: 'citizen' }).length).toBeGreaterThan(0);
  });

  it('respects the limit', () => {
    expect(suggestedTopics({ audience: 'citizen', limit: 3 }).length).toBe(3);
  });
});
