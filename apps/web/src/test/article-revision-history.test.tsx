import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArticleRevisionHistory } from "@/components/admin/ArticleRevisionHistory";
import type { AdminArticle, AdminRevision } from "@/lib/api/admin";

describe("article revision history", () => {
  it("shows readable actions in newest-first order supplied by the API", () => {
    render(<ArticleRevisionHistory onLoadRevision={vi.fn()} revisions={[
      revision("2", 2, "PUBLISHED", "发布版本"),
      revision("1", 1, "CREATED", "初始版本"),
    ]} />);

    expect(screen.getByText("共 2 个版本，可预览或载入后重新保存")).toBeVisible();
    fireEvent.click(screen.getByText("修改记录"));
    expect(screen.getByText("发布")).toBeVisible();
    expect(screen.getByText("创建内容")).toBeVisible();
  });

  it("previews a saved version with the visitor article renderer", () => {
    render(<ArticleRevisionHistory onLoadRevision={vi.fn()} revisions={[revision("1", 1, "CREATED", "历史文章标题")]} />);
    fireEvent.click(screen.getByText("修改记录"));
    fireEvent.click(screen.getByRole("button", { name: "预览版本" }));

    expect(screen.getByRole("dialog", { name: "历史版本 1 预览" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "历史文章标题" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "返回修改记录" }));
    expect(screen.queryByRole("dialog", { name: "历史版本 1 预览" })).not.toBeInTheDocument();
  });

  it("passes the selected snapshot back to the editor", () => {
    const onLoadRevision = vi.fn();
    const savedRevision = revision("1", 1, "CREATED", "历史文章标题");
    render(<ArticleRevisionHistory onLoadRevision={onLoadRevision} revisions={[savedRevision]} />);
    fireEvent.click(screen.getByText("修改记录"));
    fireEvent.click(screen.getByRole("button", { name: "载入此版本" }));
    expect(onLoadRevision).toHaveBeenCalledWith(savedRevision);
  });
});

function revision(id: string, version: number, action: string, title: string): AdminRevision {
  return {
    id,
    version,
    action,
    actorId: "user",
    createdAt: "2026-08-13T02:00:00Z",
    snapshot: articleSnapshot(title),
  };
}

function articleSnapshot(title: string): AdminArticle {
  return {
    id: "article-1",
    locale: "zh",
    slug: "saved-version",
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
    publishedAt: "2026-08-13T00:00:00+09:00",
    displayOrder: 0,
    relatedServices: [],
    seoTitle: null,
    seoDescription: null,
    youtubeUrl: null,
    demo: false,
    version: 1,
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
