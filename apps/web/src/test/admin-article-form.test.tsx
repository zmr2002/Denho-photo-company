import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminArticleForm, resolveArticleExcerpt } from "@/components/admin/AdminArticleForm";
import { blankArticleFormValues } from "@/lib/admin/article-form";
import { writeAdminApi } from "@/lib/api/browser";
import type { AdminArticle, AdminRevision } from "@/lib/api/admin";

const router = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/lib/api/browser", () => ({
  writeAdminApi: vi.fn(),
}));

describe("article editor", () => {
  beforeEach(() => {
    router.push.mockReset();
    router.refresh.mockReset();
    vi.mocked(writeAdminApi).mockReset();
  });

  it("adds and reorders only the selected content block types", () => {
    render(<AdminArticleForm defaultValues={blankArticleFormValues()} />);

    expect(screen.getByLabelText("文章标题")).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByLabelText("正文")).toBeVisible();

    const addToolbar = screen.getByLabelText("添加文章内容");
    fireEvent.click(within(addToolbar).getByRole("button", { name: "小标题" }));
    fireEvent.click(within(addToolbar).getByRole("button", { name: "图片" }));

    const blocks = screen.getAllByRole("article");
    expect(blocks).toHaveLength(3);
    expect(blocks.map((block) => block.querySelector("strong")?.textContent)).toEqual(["正文", "小标题", "图片"]);
    expect(within(blocks[1]).queryByLabelText("正文")).not.toBeInTheDocument();
    expect(within(blocks[2]).getByLabelText("图片路径")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "上移第 3 个区块" }));

    const reorderedBlocks = screen.getAllByRole("article");
    expect(reorderedBlocks.map((block) => block.querySelector("strong")?.textContent)).toEqual(["正文", "图片", "小标题"]);
  });

  it("inserts and duplicates content beside the block being edited", () => {
    const values = blankArticleFormValues();
    values.blocks[0].body = "需要复制的正文";
    render(<AdminArticleForm defaultValues={values} />);

    fireEvent.click(screen.getByRole("button", { name: "复制第 1 个区块" }));
    expect(screen.getAllByLabelText("正文")).toHaveLength(2);
    expect(screen.getAllByLabelText("正文")[1]).toHaveValue("需要复制的正文");

    const firstBlock = screen.getAllByRole("article")[0];
    fireEvent.click(within(firstBlock).getByRole("button", { name: "图片" }));
    expect(screen.getAllByRole("article").map((block) => block.querySelector("strong")?.textContent)).toEqual(["正文", "图片", "正文"]);
  });

  it("creates an automatic excerpt and preserves content order when saving", async () => {
    const defaultValues = blankArticleFormValues();
    defaultValues.title = "新的制作记录";
    defaultValues.slug = "new-production-story";
    defaultValues.publishedAt = "2026-08-10";
    defaultValues.blocks[0].body = "这是第一段正文，会自动成为文章摘要。";

    vi.mocked(writeAdminApi).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "article-1", version: 1, status: "DRAFT" }),
    } as Response);

    render(<AdminArticleForm defaultValues={defaultValues} />);
    fireEvent.click(within(screen.getByLabelText("添加文章内容")).getByRole("button", { name: "小标题" }));
    fireEvent.change(screen.getByLabelText("小标题"), { target: { value: "拍摄准备" } });
    fireEvent.click(screen.getByRole("button", { name: "保存草稿" }));

    await waitFor(() => expect(writeAdminApi).toHaveBeenCalledTimes(1));
    const [path, method, payload] = vi.mocked(writeAdminApi).mock.calls[0];
    expect(path).toBe("/api/v1/admin/articles");
    expect(method).toBe("POST");
    expect(payload).toMatchObject({
      title: "新的制作记录",
      excerpt: "这是第一段正文，会自动成为文章摘要。",
      publishedAt: "2026-08-10T00:00:00+09:00",
      blocks: [
        { type: "paragraph", body: "这是第一段正文，会自动成为文章摘要。", sortOrder: 0 },
        { type: "heading", heading: "拍摄准备", sortOrder: 1 },
      ],
    });
    expect(payload).not.toHaveProperty("relatedServicesText");
    expect(payload).toMatchObject({
      ctaHref: null,
      heroImagePath: null,
      youtubeUrl: null,
      blocks: [
        { type: "paragraph", body: "这是第一段正文，会自动成为文章摘要。", heading: null },
        { type: "heading", heading: "拍摄准备", body: null },
      ],
    });
    expect(router.refresh).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/studio-tianho/articles/article-1");
    expect(await screen.findByText("文章已保存。")).toBeVisible();

    const unloadEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unloadEvent);
    expect(unloadEvent.defaultPrevented).toBe(false);
  });

  it("uses a manual excerpt when supplied and limits generated excerpts", () => {
    const blocks = blankArticleFormValues().blocks;
    blocks[0].body = "正文内容";
    expect(resolveArticleExcerpt("手动摘要", blocks, "文章标题")).toBe("手动摘要");

    blocks[0].body = "长".repeat(180);
    const generated = resolveArticleExcerpt("", blocks, "文章标题");
    expect(generated).toHaveLength(140);
    expect(generated.endsWith("…")).toBe(true);
  });

  it("shows publication controls only to administrators", () => {
    const defaultValues = blankArticleFormValues();
    defaultValues.status = "published";

    const { rerender } = render(<AdminArticleForm defaultValues={defaultValues} />);
    expect(screen.getByText("已发布")).toBeVisible();
    expect(screen.queryByRole("button", { name: "保存并撤下" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "归档文章" })).not.toBeInTheDocument();

    rerender(
      <AdminArticleForm
        articleId="article-1"
        canManagePublication
        defaultValues={defaultValues}
      />,
    );
    expect(screen.queryByRole("combobox", { name: "状态" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存并撤下" })).toBeVisible();
    expect(screen.getByRole("button", { name: "归档文章" })).toBeVisible();
  });

  it("restores an archived article when an administrator selects draft", async () => {
    const defaultValues = blankArticleFormValues();
    defaultValues.title = "归档文章";
    defaultValues.slug = "archived-article";
    defaultValues.blocks[0].body = "正文";
    defaultValues.status = "archived";

    vi.mocked(writeAdminApi)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "article-1", version: 4, status: "ARCHIVED" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "article-1", version: 5, status: "DRAFT" }),
      } as Response);

    render(
      <AdminArticleForm
        articleId="article-1"
        canManagePublication
        contentVersion={3}
        defaultValues={defaultValues}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "恢复为草稿" }));

    await waitFor(() => expect(writeAdminApi).toHaveBeenCalledTimes(2));
    expect(writeAdminApi).toHaveBeenLastCalledWith(
      "/api/v1/admin/articles/article-1/restore",
      "POST",
      { expectedVersion: 4 },
    );
  });

  it("keeps draft saving separate from publishing", async () => {
    const defaultValues = blankArticleFormValues();
    defaultValues.title = "待发布文章";
    defaultValues.slug = "article-to-publish";
    defaultValues.blocks[0].body = "正文";
    vi.mocked(writeAdminApi)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "article-2", version: 1, status: "DRAFT" }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "article-2", version: 2, status: "PUBLISHED" }) } as Response);
    render(<AdminArticleForm canManagePublication defaultValues={defaultValues} />);

    fireEvent.click(screen.getByRole("button", { name: "保存并发布" }));

    await waitFor(() => expect(writeAdminApi).toHaveBeenCalledTimes(2));
    expect(writeAdminApi).toHaveBeenLastCalledWith("/api/v1/admin/articles/article-2/publish", "POST", { expectedVersion: 1 });
    expect(await screen.findByText("文章已发布。")).toBeVisible();
    expect(screen.getByText("已发布")).toBeVisible();
  });

  it("saves edits to a published article without changing its public status", async () => {
    const values = blankArticleFormValues();
    values.title = "已发布文章";
    values.slug = "published-article";
    values.status = "published";
    values.blocks[0].body = "修改后的正文";
    vi.mocked(writeAdminApi).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "article-3", version: 7, status: "PUBLISHED" }),
    } as Response);
    render(<AdminArticleForm articleId="article-3" canManagePublication contentVersion={6} defaultValues={values} />);

    fireEvent.click(screen.getByRole("button", { name: "保存修改" }));

    await waitFor(() => expect(writeAdminApi).toHaveBeenCalledTimes(1));
    expect(writeAdminApi).toHaveBeenCalledWith("/api/v1/admin/articles/article-3", "PATCH", expect.objectContaining({ expectedVersion: 6 }));
    expect(await screen.findByText("文章已保存。")).toBeVisible();
    expect(screen.getByText("已发布")).toBeVisible();
  });

  it("loads a saved revision as an unsaved edit while preserving the current status and version", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const values = blankArticleFormValues();
    values.title = "当前文章标题";
    values.slug = "current-article";
    values.status = "published";
    values.blocks[0].body = "当前正文";
    const revision: AdminRevision = {
      id: "revision-2",
      version: 2,
      action: "UPDATED",
      actorId: "user",
      createdAt: "2026-08-13T00:00:00Z",
      snapshot: articleSnapshot("历史文章标题"),
    };
    vi.mocked(writeAdminApi).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "article-4", version: 9, status: "PUBLISHED" }),
    } as Response);

    render(
      <AdminArticleForm
        articleId="article-4"
        canManagePublication
        contentVersion={8}
        defaultValues={values}
        revisions={[revision]}
      />,
    );

    fireEvent.click(screen.getByText("修改记录"));
    fireEvent.click(screen.getByRole("button", { name: "载入此版本" }));
    expect(await screen.findByDisplayValue("历史文章标题")).toBeVisible();
    expect(screen.getByText("已发布")).toBeVisible();
    expect(screen.getByText("版本 2 已载入为未保存修改，请预览确认后保存。")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "保存修改" }));
    await waitFor(() => expect(writeAdminApi).toHaveBeenCalledTimes(1));
    expect(writeAdminApi).toHaveBeenCalledWith(
      "/api/v1/admin/articles/article-4",
      "PATCH",
      expect.objectContaining({ expectedVersion: 8, article: expect.objectContaining({ title: "历史文章标题" }) }),
    );
  });
});

function articleSnapshot(title: string): AdminArticle {
  return {
    id: "article-4",
    locale: "zh",
    slug: "historical-article",
    title,
    excerpt: "历史摘要",
    category: "通知",
    authorName: "编辑团队",
    heroLabel: null,
    heroImagePath: null,
    heroAlt: null,
    heroTone: "neutral",
    heroCaption: null,
    closingNote: null,
    ctaLabel: null,
    ctaHref: null,
    status: "draft",
    publishedAt: "2026-08-12T00:00:00+09:00",
    displayOrder: 0,
    relatedServices: [],
    seoTitle: null,
    seoDescription: null,
    youtubeUrl: null,
    demo: false,
    version: 2,
    blocks: [{
      type: "paragraph",
      heading: null,
      body: "历史正文",
      imagePath: null,
      imageAlt: null,
      imageTone: "neutral",
      caption: null,
      sortOrder: 0,
    }],
  };
}
