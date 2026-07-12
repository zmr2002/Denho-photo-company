import { expect, test, type Page } from "@playwright/test";

const apiPort = process.env.API_TEST_PORT || "8080";
const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
const apiReadinessUrl = `${apiBaseUrl}/actuator/health/readiness`;
async function dismissOpeningNotice(page: Page) {
  const dismissButton = page.locator(".site-opening-notice-dismiss");
  const appeared = await dismissButton.waitFor({ state: "visible", timeout: 3_000 })
    .then(() => true)
    .catch(() => false);
  if (appeared) await dismissButton.click();
}

test("serves all public language routes with security headers", async ({ page, request }) => {
  for (const locale of ["ja", "zh", "en"]) {
    const response = await page.goto(`/${locale}/`);
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("body")).toBeVisible();
  }

  const response = await page.goto("/ja/");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(response?.headers()["content-security-policy"]).toMatch(/'nonce-[^']+'/);
  expect(response?.headers()["content-security-policy"]).not.toMatch(/script-src [^;]*'unsafe-inline'/);
  expect(response?.headers()["content-security-policy"]).not.toContain("upgrade-insecure-requests");
  expect(response?.headers()["content-security-policy-report-only"]).toBeUndefined();

  const secureResponse = await request.get("/ja/", {
    headers: { "x-forwarded-proto": "https" },
  });
  expect(secureResponse.headers()["content-security-policy"]).toContain("upgrade-insecure-requests");
});

test("preserves the services to works link", async ({ page }) => {
  await page.goto("/ja/services/");
  await dismissOpeningNotice(page);
  const link = page.locator("a.service-works-link").first();
  await expect(link).toHaveAttribute("href", /\/ja\/works\/#.+/);
  await link.click();
  await expect(page).toHaveURL(/\/ja\/works\/#.+/);
});

test("submits a validated contact inquiry", async ({ page }) => {
  await page.goto("/en/contact/");
  await dismissOpeningNotice(page);
  await page.locator('[name="nameCompany"]').fill("Browser Check Company");
  await page.locator('[name="email"]').fill("browser-check@example.com");
  await page.locator('[name="projectType"]').selectOption({ index: 1 });
  await page.locator('[name="message"]').fill("Please provide information about a photography project in Tokyo.");
  await page.locator('[name="consented"]').check();
  await page.locator('form[aria-label] button[type="submit"]').click();
  await expect(page.getByText("Your inquiry has been received.")).toBeVisible();
});

test("renders published content from the public API", async ({ page, request }) => {
  const response = await request.get(`${apiBaseUrl}/api/v1/public/articles?locale=zh`);
  expect(response.ok()).toBeTruthy();
  const articles = await response.json() as Array<{ slug: string }>;
  expect(articles.some((article) => article.slug === "admin-tutorial-sample")).toBeTruthy();

  const pageResponse = await page.goto("/zh/articles/admin-tutorial-sample/");
  expect(pageResponse?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("后台教学示例");
});

test("protects administration and exposes readiness", async ({ page, request }) => {
  const readiness = await request.get(apiReadinessUrl);
  expect(readiness.ok()).toBeTruthy();
  expect((await readiness.json()).status).toBe("UP");

  const unauthorized = await request.get(`${apiBaseUrl}/api/v1/admin/inquiries`);
  expect(unauthorized.status()).toBe(401);
  expect(unauthorized.headers()["cache-control"]).toContain("no-store");

  await page.goto("/studio-tianho/login/");
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
});
