import { z } from 'zod';
import { errorMiddleware } from '../../src/middlewares/error.middleware.js';
import { notFoundMiddleware } from '../../src/middlewares/not-found.middleware.js';
import { authorize, authorizeRootAdmin } from '../../src/middlewares/role.middleware.js';
import { AppError } from '../../src/utils/app-error.js';

function mockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

const req = { path: '/x', method: 'POST' };

describe('errorMiddleware', () => {
  test('AppError -> typed envelope with status + fields', () => {
    const res = mockRes();
    errorMiddleware(new AppError(422, 'BAD', 'Bad thing', { a: 'x' }), req, res, () => {});
    expect(res.statusCode).toBe(422);
    expect(res.body).toMatchObject({
      success: false,
      error: { code: 'BAD', message: 'Bad thing' },
    });
    expect(res.body.error.fields).toEqual({ a: 'x' });
  });

  test('ZodError -> 400 VALIDATION_ERROR with field map', () => {
    const res = mockRes();
    let err;
    try {
      z.object({ name: z.string() }).parse({ name: 123 });
    } catch (e) {
      err = e;
    }
    errorMiddleware(err, req, res, () => {});
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.fields.name).toBeDefined();
  });

  test('Mongo duplicate key (11000) -> 409 DUPLICATE_KEY', () => {
    const res = mockRes();
    errorMiddleware({ code: 11000, keyPattern: { mobile: 1 } }, req, res, () => {});
    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_KEY');
    expect(res.body.error.fields.mobile).toBeDefined();
  });

  test('unknown error -> 500 INTERNAL_ERROR', () => {
    const res = mockRes();
    errorMiddleware(new Error('kaboom'), req, res, () => {});
    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('notFoundMiddleware', () => {
  test('returns 404 with NOT_FOUND code', () => {
    const res = mockRes();
    notFoundMiddleware({ method: 'GET', originalUrl: '/api/v1/non-existent' }, res);
    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('role authorization edge cases', () => {
  test('authorize without req.user passes 401 UNAUTHORIZED to next', () => {
    let nextErr;
    authorize('officer')({}, {}, (err) => {
      nextErr = err;
    });
    expect(nextErr).toBeInstanceOf(AppError);
    expect(nextErr.statusCode).toBe(401);
  });

  test('authorizeRootAdmin without req.user passes 401 UNAUTHORIZED to next', () => {
    let nextErr;
    authorizeRootAdmin({}, {}, (err) => {
      nextErr = err;
    });
    expect(nextErr).toBeInstanceOf(AppError);
    expect(nextErr.statusCode).toBe(401);
  });
});
