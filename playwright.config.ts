import { defineConfig } from '@playwright/test';

// Playwright configuration for smoke tests of the Vite sample app in a CI environment
export default defineConfig({
  // Directory containing the smoke test files
  testDir: './scripts/smoke',
  // Fail the test if any test is marked as 'only'
  forbidOnly: true,
  // Number of retries for failed tests
  retries: 0,
  // Number of parallel workers for running tests
  workers: 1,
  // Reporter configuration for test results
  reporter: [['list'], ['html', { open: 'never' }]],
  // Shared settings for all tests such as browser, base URL, and failure handling
  use: {
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Web server configuration for serving the built app during smoke tests
  webServer: {
    command:
      'npm exec vite -- preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
