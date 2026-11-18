import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    // Placeholder Sanity config so modules that import src/sanity/env load without .env.local.
    env: { NEXT_PUBLIC_SANITY_PROJECT_ID: 'test1234', NEXT_PUBLIC_SANITY_DATASET: 'production' },
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    // next-sanity imports `next/headers` without an extension, which Node ESM can't resolve.
    server: { deps: { inline: ['next-sanity'] } },
  },
});
