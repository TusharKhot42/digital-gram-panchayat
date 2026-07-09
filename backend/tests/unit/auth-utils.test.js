import { hashPassword, comparePassword } from '../../src/utils/password.js';
import { signToken, verifyToken } from '../../src/utils/jwt.js';

describe('password hashing', () => {
  test('hash is not the plaintext and verifies correctly', async () => {
    const hash = await hashPassword('Secret@123');
    expect(hash).not.toBe('Secret@123');
    expect(hash.length).toBeGreaterThan(20);
    await expect(comparePassword('Secret@123', hash)).resolves.toBe(true);
  });

  test('wrong password does not verify', async () => {
    const hash = await hashPassword('Secret@123');
    await expect(comparePassword('WrongPass', hash)).resolves.toBe(false);
  });
});

describe('jwt', () => {
  test('sign then verify round-trips subject and role', () => {
    const token = signToken({ id: 'abc123', role: 'citizen' });
    const payload = verifyToken(token);
    expect(payload.sub).toBe('abc123');
    expect(payload.role).toBe('citizen');
  });

  test('tampered token fails verification', () => {
    const token = signToken({ id: 'abc123', role: 'citizen' });
    expect(() => verifyToken(token + 'tamper')).toThrow();
  });
});
