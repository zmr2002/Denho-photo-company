import { expect, test, type Locator, type Page } from "@playwright/test";

const administrator = {
  email: requiredEnvironment("BROWSER_TEST_ADMIN_EMAIL"),
  password: requiredEnvironment("BROWSER_TEST_ADMIN_PASSWORD"),
};

function requiredEnvironment(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for browser checks`);
  return value;
}

async function login(page: Page, account = administrator) {
  await page.setExtraHTTPHeaders({ "X-Forwarded-For": requiredEnvironment("BROWSER_TEST_CLIENT_IP") });
  await page.goto("/studio-tianho/login");
  await page.getByLabel("邮箱").fill(account.email);
  await page.getByLabel("密码").fill(account.password);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/\/studio-tianho\/?$/);
  await expect(page.getByRole("heading", { name: "内容控制台" })).toBeVisible();
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page).toHaveURL(/\/studio-tianho\/login\/?$/);
}

async function replaceInput(locator: Locator, value: string) {
  await locator.click();
  await locator.press("ControlOrMeta+A");
  await locator.press("Backspace");
  await locator.fill(value);
  await expect(locator).toHaveValue(value);
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
  await expect(page).toHaveURL(/\/studio-tianho\/login\/?\?returnTo=%2Fstudio-tianho%2Farticles(?:%2F)?$/);
  await expect(page.getByRole("heading", { name: "田豊管理中心" })).toBeVisible();
  await page.getByLabel("邮箱").fill(administrator.email);
  await page.getByLabel("密码").fill(administrator.password);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/\/studio-tianho\/articles\/?$/);
  await expect(page.getByRole("heading", { name: "文章管理" })).toBeVisible();
});

test("covers editor permissions, publishing, conflicts and revision recovery", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "The complete editing workflow runs once on desktop.");
  test.setTimeout(90_000);

  const runId = requiredEnvironment("BROWSER_TEST_RUN_ID").replaceAll("-", "").slice(0, 16);
  const editor = {
    email: `browser-editor-${runId}@example.test`,
    password: `editor-${runId}-password`,
  };
  const originalTitle = `浏览器工作流 ${runId}`;
  const editorTitle = `编辑修改 ${runId}`;
  const firstAdminTitle = `管理员修改 ${runId}`;
  const conflictingTitle = `冲突修改 ${runId}`;
  const slug = `browser-workflow-${runId}`;

  await login(page);
  await page.goto("/studio-tianho/users");
  await page.getByLabel("显示名称").fill("浏览器编辑账号");
  await page.getByLabel("邮箱").fill(editor.email);
  await page.getByLabel("初始密码").fill(editor.password);
  await page.getByRole("button", { name: "创建账号" }).click();
  await expect(page.getByText("账号已创建，请将初始密码通过安全方式交给本人。")).toBeVisible();

  await page.goto("/studio-tianho/articles/new");
  await page.getByLabel("文章标题").fill(originalTitle);
  await page.getByText("其他设置").click();
  await page.getByLabel("网址标识").fill(slug);
  await page.getByRole("textbox", { name: "正文", exact: true }).fill("用于验证后台真实编辑、发布、冲突处理和版本载入的文章正文。");
  await page.getByRole("button", { name: "保存草稿" }).click();
  await expect(page).toHaveURL(/\/studio-tianho\/articles\/[0-9a-f-]+\/?$/);
  const articlePath = new URL(page.url()).pathname;
  await expect(page.getByLabel("文章标题")).toHaveValue(originalTitle);

  await logout(page);
  await login(page, editor);
  await page.goto(articlePath);
  await expect(page.getByRole("link", { name: "账号管理" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "操作记录" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "保存并发布" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "归档文章" })).toHaveCount(0);
  await replaceInput(page.getByLabel("文章标题"), editorTitle);
  await page.getByRole("button", { name: "保存草稿" }).click();
  await expect(page.getByText("文章已保存。")).toBeVisible();

  await logout(page);
  await login(page);
  await page.goto(articlePath);
  await page.getByRole("button", { name: "保存并发布" }).click();
  await expect(page.getByText("文章已发布。")).toBeVisible();
  await expect(page.getByText("已发布", { exact: true })).toBeVisible();

  const secondPage = await page.context().newPage();
  await secondPage.goto(articlePath);
  await expect(secondPage.getByLabel("文章标题")).toHaveValue(editorTitle);
  await replaceInput(page.getByLabel("文章标题"), firstAdminTitle);
  await replaceInput(secondPage.getByLabel("文章标题"), conflictingTitle);
  await page.getByRole("button", { name: "保存修改" }).click();
  await expect(page.getByText("文章已保存。")).toBeVisible();
  await secondPage.getByRole("button", { name: "保存修改" }).click();
  await expect(secondPage.getByText(/内容已被其他操作更新/)).toBeVisible();
  await expect(secondPage.getByLabel("文章标题")).toHaveValue(conflictingTitle);
  await secondPage.close();

  await page.getByText("修改记录").click();
  const revisionButtons = page.getByRole("button", { name: "载入此版本" });
  await expect(revisionButtons).not.toHaveCount(0);
  await revisionButtons.last().click();
  await expect(page.getByLabel("文章标题")).toHaveValue(originalTitle);
  await expect(page.getByText(/已载入为未保存修改/)).toBeVisible();
  await expect(page.getByText("已发布", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "保存修改" }).click();
  await expect(page.getByText("文章已保存。")).toBeVisible();

  await page.goto(`/ja/articles/${slug}/`);
  await expect(page.getByRole("heading", { level: 1, name: originalTitle })).toBeVisible();
});
