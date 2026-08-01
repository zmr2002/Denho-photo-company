import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleListPage } from "@/components/pages/ArticleListPage";
import type { Article } from "@/lib/content/types";

const article: Article = {
  id: "11111111-1111-4111-8111-111111111111",
  language: "zh",
  slug: "public-article",
  title: "公开文章",
  excerpt: "文章摘要",
  category: "教学",
  authorName: "编辑",
  publishedAt: "2026-07-12",
  updatedAt: "2026-07-12",
  status: "published",
  featuredImage: { label: "封面", alt: "封面", tone: "warm" },
  body: [],
  contentBlocks: [],
  relatedServices: [],
  seoTitle: "公开文章",
  seoDescription: "文章摘要",
};

describe("ArticleListPage", () => {
  it("renders API-compatible article data with the existing route", () => {
    render(<ArticleListPage articles={[article]} locale="zh" />);
    expect(screen.getByRole("heading", { name: "文章列表" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "公开文章" })).toHaveAttribute(
      "href",
      "/zh/articles/public-article",
    );
    expect(screen.getByText("文章摘要")).toBeInTheDocument();
  });
});
