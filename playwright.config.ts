import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  workers: 1, // tests share local storage state per origin; keep them sequential
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview',
    port: 4321,
    // Reuse a local dev server, but always start fresh in CI where a
    // stale listener could silently test the wrong build.
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // The full chromium binary in new-headless mode (the bundled
        // headless shell is not shipped for all Linux environments).
        channel: 'chromium',
      },
    },
  ],
});
