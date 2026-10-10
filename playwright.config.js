// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { loadEnvConfig } = require('@next/env');

// Match the production server's environment without printing configuration values.
loadEnvConfig(process.cwd(), false, { info() {}, error(message) { console.error(message); } });

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run start -- --hostname 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || undefined }
    }
  ]
});

