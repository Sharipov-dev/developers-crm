import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/main/**', 'src/**/*.d.ts'],
    },
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      PORT: '3000',
      HOST: '0.0.0.0',
      DEFAULT_PAGE_SIZE: '20',
      MAX_PAGE_SIZE: '100',
    },
  },
  resolve: {
    alias: {
      '@domain': './src/domain',
      '@application': './src/application',
      '@infrastructure': './src/infrastructure',
      '@interfaces': './src/interfaces',
      '@shared': './src/shared',
      '@main': './src/main',
    },
  },
});
