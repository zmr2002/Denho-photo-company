import { defineConfig, devices } from "@playwright/test";

const apiPort = process.env.API_TEST_PORT || "8080";
const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
const isWindows = process.platform === "win32";
const webCommand = isWindows
  ? "set CONTENT_PROVIDER=mock&& npm run build && set CONTENT_PROVIDER=api&& npm run start"
  : "CONTENT_PROVIDER=mock npm run build && CONTENT_PROVIDER=api npm run start";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: isWindows ? "gradlew.bat bootRun" : "./gradlew bootRun --no-daemon",
      cwd: "../api",
      env: {
        DATABASE_URL: process.env.API_TEST_DATABASE_URL || "jdbc:postgresql://127.0.0.1:5432/tianho",
        DATABASE_USERNAME: process.env.API_TEST_DATABASE_USERNAME || "tianho",
        SERVER_PORT: apiPort,
        DATABASE_PASSWORD: process.env.API_TEST_DATABASE_PASSWORD || "tianho-local",
        SESSION_SCHEMA_INITIALIZATION: "never",
        CONTENT_BOOTSTRAP_ENABLED: "true",
      },
      url: `${apiBaseUrl}/actuator/health/readiness`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: webCommand,
      cwd: ".",
      env: {
        API_INTERNAL_URL: apiBaseUrl,
      },
      url: "http://127.0.0.1:3000/ja/",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
