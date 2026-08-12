import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminArticleForm, resolveArticleExcerpt } from "@/components/admin/AdminArticleForm";
import { blankArticleFormValues } from "@/lib/admin/article-form";
import { writeAdminApi } from "@/lib/api/browser";

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

    fireEvent.click(screen.getByRole("button", { name: "小标题" }));
    fireEvent.click(screen.getByRole("button", { name: "图片" }));

    const blocks = screen.getAllByRole("article");
    expect(blocks).toHaveLength(3);
    expect(blocks.map((block) => block.querySelector("strong")?.textContent)).toEqual(["正文", "小标题", "图片"]);
    expect(within(blocks[1]).queryByLabelText("正文")).not.toBeInTheDocument();
    expect(within(blocks[2]).getByLabelText("图片路径")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "上移第 3 个区块" }));

    const reorderedBlocks = screen.getAllByRole("article");
    expect(reorderedBlocks.map((block) => block.querySelector("strong")?.textContent)).toEqual(["正文", "图片", "小标题"]);
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
    fireEvent.click(screen.getByRole("button", { name: "小标题" }));
    fireEvent.change(screen.getByLabelText("小标题"), { target: { value: "拍摄准备" } });
    fireEvent.click(screen.getByRole("button", { name: "保存文章" }));

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
    expect(router.refresh).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/studio-tianho/articles/article-1");
    expect(await screen.findByText("已保存。")).toBeVisible();
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
});
