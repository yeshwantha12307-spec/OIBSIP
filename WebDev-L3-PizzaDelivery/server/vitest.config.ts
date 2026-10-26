import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
    fileParallelism: false, // Run test files sequentially to share memory and prevent simultaneous mongod launches
  },
});
