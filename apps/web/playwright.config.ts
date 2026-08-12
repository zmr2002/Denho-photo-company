import { defineConfig, devices } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const apiPort = process.env.API_TEST_PORT || "8080";
const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
const localEnvironment = readLocalEnvironment();
const databasePort = process.env.API_TEST_DATABASE_PORT || localEnvironment.POSTGRES_PORT || "5432";
const databaseName = process.env.API_TEST_DATABASE_NAME || localEnvironment.POSTGRES_DB || "tianho";
const databaseUsername = process.env.API_TEST_DATABASE_USERNAME || localEnvironment.POSTGRES_USER || "tianho";
const databasePassword = process.env.API_TEST_DATABASE_PASSWORD || localEnvironment.POSTGRES_PASSWORD || "tianho-local";
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
        DATABASE_URL:
          process.env.API_TEST_DATABASE_URL ||
          `jdbc:postgresql://127.0.0.1:${databasePort}/${databaseName}`,
        DATABASE_USERNAME: databaseUsername,
        SERVER_PORT: apiPort,
        DATABASE_PASSWORD: databasePassword,
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

function readLocalEnvironment(): Record<string, string> {
  try {
    const path = resolve(process.cwd(), "../../infra/.env");
    return Object.fromEntries(
      readFileSync(path, "utf8")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const separator = line.indexOf("=");
          const key = line.slice(0, separator).trim();
          const value = line.slice(separator + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
          return [key, value];
        }),
    );
  } catch {
    return {};
  }
}
