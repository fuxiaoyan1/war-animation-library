import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 8_000
  },
  use: {
    baseURL: process.env.FRONTEND_URL ?? "http://127.0.0.1:4177",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: process.env.FRONTEND_URL
    ? undefined
    : {
        command: "npm run preview",
        url: "http://127.0.0.1:4177",
        reuseExistingServer: !process.env.CI
      }
});
