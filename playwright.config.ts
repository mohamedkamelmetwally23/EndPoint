import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/ui',
  fullyParallel: false,
  workers: 1,
  globalTeardown: './tests/teardown.ts',
  timeout: 60000,
  reporter: 'line',
  use: { baseURL: 'http://127.0.0.1:4175', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'node --import tsx scripts/ui-server.ts', cwd: '../BackEnd', url: 'http://127.0.0.1:4001/api/v1/health', timeout: 120000, reuseExistingServer: false },
    { command: 'node scripts/e2e-web.mjs', url: 'http://127.0.0.1:4175', reuseExistingServer: false },
  ],
});
