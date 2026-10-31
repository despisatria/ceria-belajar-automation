import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          BASE_URL: env.baseURL,
          TARGET: env.isLocal ? 'local build (vite preview)' : 'production',
          NODE: process.version,
        },
      },
    ],
  ],
  use: {
    baseURL: env.baseURL,
    locale: 'id-ID',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Most kids use the app on a phone or tablet, so the core flows also run on a mobile viewport.
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      grep: /@mobile/,
    },
  ],
  webServer: env.isLocal
    ? {
        command: 'npm run build && npm run preview -- --port 4173 --strictPort',
        cwd: env.appDir,
        url: env.baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      }
    : undefined,
});
