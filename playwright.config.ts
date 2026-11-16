import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
// Override with PORT when another local server already occupies 3000.
const port = process.env.PORT ?? '3000';
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? 'html' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    // `npm run check` builds once beforehand and sets E2E_SKIP_BUILD to avoid a second build.
    command: process.env.E2E_SKIP_BUILD ? 'npm run start' : 'npm run build && npm run start',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 180000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 375, height: 812 },
      },
    },
  ],
});
