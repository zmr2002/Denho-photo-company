import { expect, test, type Page } from "@playwright/test";

const administrator = {
  email: requiredEnvironment("BROWSER_TEST_ADMIN_EMAIL"),
  password: requiredEnvironment("BROWSER_TEST_ADMIN_PASSWORD"),
};

function requiredEnvironment(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for browser checks`);
  return value;
}

async function login(page: Page) {
  await page.setExtraHTTPHeaders({ "X-Forwarded-For": requiredEnvironment("BROWSER_TEST_CLIENT_IP") });
  await page.goto("/studio-tianho/login");
  await page.getByLabel("邮箱").fill(administrator.email);
  await page.getByLabel("密码").fill(administrator.password);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/\/studio-tianho\/?$/);
  await expect(page.getByRole("heading", { name: "内容控制台" })).toBeVisible();
}

test("supports the main administration journey after login", async ({ page }) => {
  await login(page);

  const destinations = [
    { name: "文章管理", path: "/studio-tianho/articles", heading: "文章管理" },
    { name: "开场通知", path: "/studio-tianho/notice", heading: "弹窗通知" },
    { name: "作品图片", path: "/studio-tianho/works", heading: "作品图片管理" },
    { name: "媒体库", path: "/studio-tianho/media", heading: "媒体库" },
    { name: "咨询管理", path: "/studio-tianho/inquiries", heading: "咨询管理" },
    { name: "账号管理", path: "/studio-tianho/users", heading: "账号管理" },
    { name: "操作记录", path: "/studio-tianho/activity", heading: "操作记录" },
  ];

  for (const destination of destinations) {
    const link = page.getByRole("navigation", { name: "后台导航" }).getByRole("link", { name: destination.name });
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${destination.path}/?$`));
    await expect(page.getByRole("heading", { name: destination.heading })).toBeVisible();
    await expect(page.getByRole("link", { name: destination.name })).toHaveAttribute("aria-current", "page");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
  }
});

test("keeps article tools understandable and keyboard accessible", async ({ page }) => {
  await login(page);
  await page.goto("/studio-tianho/articles");

  const search = page.getByRole("searchbox", { name: "搜索" });
  await search.fill("后台教学示例");
  await expect(page.getByRole("status")).toContainText("显示 1 /");
  await expect(page.getByRole("heading", { name: /后台教学示例/ })).toBeVisible();

  await page.getByRole("link", { name: "新增文章" }).click();
  await expect(page).toHaveURL(/\/studio-tianho\/articles\/new\/?$/);
  await expect(page.getByLabel("文章标题")).toBeVisible();
  await expect(page.getByRole("toolbar", { name: "添加文章内容" })).toBeVisible();

  const preview = page.getByRole("button", { name: "预览当前稿" });
  await preview.focus();
  await expect(preview).toBeFocused();
});

test("honors reduced motion and returns to login after logout", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await login(page);

  await expect(page.locator(".admin-page")).toHaveCSS("animation-name", "none");
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page).toHaveURL(/\/studio-tianho\/login\/?$/);

  await page.goto("/studio-tianho/articles");
  await expect(page).toHaveURL(/\/studio-tianho\/login\/?$/);
  await expect(page.getByRole("heading", { name: "田豊管理中心" })).toBeVisible();
});
