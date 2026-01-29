import { beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'silent';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.PORT = '3000';
  process.env.HOST = '0.0.0.0';
  process.env.DEFAULT_PAGE_SIZE = '20';
  process.env.MAX_PAGE_SIZE = '100';
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
  process.env.JWT_EXPIRES_IN = '24h';
});

afterAll(() => {
  vi.restoreAllMocks();
});
