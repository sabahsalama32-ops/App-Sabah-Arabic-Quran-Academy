import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    isolate: false,
    maxWorkers: 1,
    pool: 'threads',
    setupFiles: ['./tests/setup.ts'],
    env: {
      NODE_ENV: 'test',
    },
  },
});
