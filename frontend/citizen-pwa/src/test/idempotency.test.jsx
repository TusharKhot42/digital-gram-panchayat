import { generateIdempotencyKey, IDEMPOTENCY_HEADER } from '@dgp/shared';

describe('generateIdempotencyKey (shared)', () => {
  it('produces prefixed, unique keys', () => {
    const a = generateIdempotencyKey('cmp');
    const b = generateIdempotencyKey('cmp');
    expect(a).toMatch(/^cmp-/);
    expect(a).not.toBe(b);
  });

  it('exposes the canonical header name', () => {
    expect(IDEMPOTENCY_HEADER).toBe('Idempotency-Key');
  });
});
