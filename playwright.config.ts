import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Local workaround for WebKit when system libs can't be installed (no sudo):
 * `npm run setup:webkit-libs` unpacks libavif16 + libgav1 into .webkit-libs/,
 * LD_LIBRARY_PATH satisfies Playwright's host check; the browser itself needs
 * LD_PRELOAD because WebKit's MiniBrowser wrapper overwrites LD_LIBRARY_PATH.
 */
const webkitLibs = path.resolve(__dirname, '.webkit-libs');
const hasWebkitLibs = fs.existsSync(path.join(webkitLibs, 'libavif.so.16'));
if (hasWebkitLibs && !process.env.LD_LIBRARY_PATH?.includes(webkitLibs)) {
  process.env.LD_LIBRARY_PATH = [webkitLibs, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':');
}
const webkitLaunchOptions = hasWebkitLibs
  ? {
      env: {
        ...process.env,
        LD_PRELOAD: ['libgav1.so.1', 'libavif.so.16'].map((lib) => path.join(webkitLibs, lib)).join(' '),
      },
    }
  : {};

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'https://www.amazon.de',
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    extraHTTPHeaders: { 'Accept-Language': 'de-DE,de;q=0.9' },

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  /* Live site: be generous with timeouts and don't hammer it with many parallel workers. */
  timeout: 60_000,
  expect: { timeout: 10_000 },

  /* Configure projects for major browsers */
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
      use: { ...devices['Desktop Safari'], launchOptions: webkitLaunchOptions },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
