import { beforeEach, describe, expect, it, vi } from "vitest";

const articleSummary = {
  id: "11111111-1111-4111-8111-111111111111",
  locale: "zh",
  slug: "public-article",
  title: "公开文章",
  excerpt: "文章摘要",
  category: "教学",
  authorName: "编辑",
  heroImagePath: "/media/original/article.jpg",
  heroAlt: "文章封面",
  heroTone: "warm",
  publishedAt: "2026-07-12T00:00:00Z",
  displayOrder: 1,
  demo: false,
};

const articleDetail = {
  ...articleSummary,
  translationGroupId: "22222222-2222-4222-8222-222222222222",
  heroLabel: "文章图片",
  heroCaption: null,
  closingNote: "文章结尾",
  ctaLabel: null,
  ctaHref: "/zh/contact/",
  relatedServices: ["event"],
  seoTitle: "文章 SEO",
  seoDescription: "文章描述",
  youtubeUrl: null,
  version: 2,
  updatedAt: "2026-07-12T01:00:00Z",
  blocks: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      type: "heading",
      heading: "第一节",
      body: null,
      imagePath: null,
      imageAlt: null,
      imageTone: "neutral",
      caption: null,
      sortOrder: 1,
    },
    {
      id: "44444444-4444-4444-8444-444444444444",
      type: "paragraph",
      heading: null,
      body: "正文内容",
      imagePath: null,
      imageAlt: null,
      imageTone: "neutral",
      caption: null,
      sortOrder: 2,
    },
  ],
};

const workSummary = {
  id: "55555555-5555-4555-8555-555555555555",
  locale: "zh",
  slug: "public-work",
  title: "公开作品",
  summary: "作品摘要",
  category: "活动",
  serviceCategory: "event",
  featuredOnHomepage: true,
  featuredOrder: 1,
  mediaType: "gallery",
  coverImagePath: "/media/original/work.jpg",
  coverImageAlt: "作品封面",
  coverImageTone: "cool",
};

const workDetail = {
  ...workSummary,
  translationGroupId: "66666666-6666-4666-8666-666666666666",
  clientName: "客户",
  projectDate: "2026",
  scope: "摄影",
  challenge: "现场光线",
  approach: ["勘景", "拍摄"],
  outcome: "完成交付",
  deliverables: ["照片"],
  galleryEnabled: true,
  seoTitle: "作品 SEO",
  seoDescription: "作品描述",
  youtubeUrl: null,
  version: 3,
  updatedAt: "2026-07-12T02:00:00Z",
  images: [
    {
      id: "77777777-7777-4777-8777-777777777777",
      path: "/media/original/work.jpg",
      label: "作品封面",
      tone: "cool",
      alt: "作品替代文字",
      caption: "作品说明",
      cover: true,
      sortOrder: 1,
    },
  ],
};

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("public content API adapter", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("CONTENT_PROVIDER", "api");
  });

  it("maps article, notice, and work contracts into existing page models", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      if (url.pathname === "/api/v1/public/articles") return json([articleSummary]);
      if (url.pathname === "/api/v1/public/articles/public-article") return json(articleDetail);
      if (url.pathname === "/api/v1/public/works") return json([workSummary]);
      if (url.pathname === "/api/v1/public/works/public-work") return json(workDetail);
      if (url.pathname === "/api/v1/public/notices/current") return new Response(null, { status: 204 });
      return json({ title: "Not found" }, 404);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getApiArticle, getApiArticles, getApiNotices, getApiOpeningNotice, getApiWorks } =
      await import("@/lib/api/public-content");

    const articles = await getApiArticles("zh");
    const article = await getApiArticle("zh", "public-article");
    const notices = await getApiNotices("zh");
    const works = await getApiWorks("zh");

    expect(articles[0]).toMatchObject({ slug: "public-article", publishedAt: "2026-07-12" });
    expect(article).toMatchObject({ body: ["第一节", "正文内容"], seoTitle: "文章 SEO" });
    expect(notices[0]).toMatchObject({ detailClosing: "文章结尾", closeLabel: "关闭" });
    expect(works[0]).toMatchObject({ scope: "摄影", galleryImages: [{ src: "/media/original/work.jpg" }] });
    await expect(getApiOpeningNotice("zh")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalled();
  });

  it("rejects unavailable API responses instead of returning mock content", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ title: "Unavailable" }, 503)));
    const { getArticles } = await import("@/lib/content");
    await expect(getArticles("zh")).rejects.toThrow("Public content API returned 503");
  });

  it("rejects responses that do not match the OpenAPI contract", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json([{ locale: "zh", slug: "missing-fields" }])));
    const { getApiArticles } = await import("@/lib/api/public-content");
    await expect(getApiArticles("zh")).rejects.toThrow();
  });
});
