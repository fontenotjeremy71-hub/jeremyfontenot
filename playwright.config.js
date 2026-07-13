const { defineConfig, devices } = require("@playwright/test");

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4174";
const serverPort = new URL(baseURL).port || "4174";

module.exports = defineConfig({
  testDir: "./tests/playwright",
  outputDir: "artifacts/playwright/test-results",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: [
    ["line"],
    ["html", { outputFolder: "artifacts/playwright/report", open: "never" }],
  ],
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
      },
    },
  ],
  webServer: {
    command: "node scripts/testing/serve-static-site.js",
    url: `${baseURL}/sitemap.xml`,
    reuseExistingServer: false,
    timeout: 30_000,
    env: {
      ...process.env,
      STATIC_SITE_PORT: serverPort,
    },
  },
});
