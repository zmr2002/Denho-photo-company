import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SiteOpeningNotice } from "@/components/ui/SiteOpeningNotice";
import {
  adminArticleToHomeNewsItem,
  selectAdminArticlesForPlacement,
} from "@/lib/admin/article-preview";
import { adminNoticeToPreview } from "@/lib/admin/notice-preview";
import type { AdminArticle, AdminNotice } from "@/lib/api/admin";
import type { SiteNotice } from "@/lib/content";

describe("administration previews", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => vi.unstubAllGlobals());

  it("shows the target draft among published articles using the public ordering rules", () => {
    const target = article({ id: "target", status: "draft", displayOrder: 1, publishedAt: null });
    const sameOrderPublished = article({ id: "published-first", displayOrder: 1, publishedAt: "2026-07-31T00:00:00Z" });
    const laterPublished = article({ id: "published-later", displayOrder: 2, publishedAt: "2026-08-01T00:00:00Z" });
    const otherDraft = article({ id: "other-draft", status: "draft", displayOrder: 0 });
    const otherLocale = article({ id: "other-locale", locale: "ja", displayOrder: 0 });

    expect(
      selectAdminArticlesForPlacement(
        [laterPublished, otherDraft, otherLocale, sameOrderPublished, target],
        target.id,
      ).map((item) => item.id),
    ).toEqual(["target", "published-first", "published-later"]);
  });

  it("maps ordered article blocks to the homepage article viewer", () => {
    const source = article({
      id: "homepage-preview",
      title: "首页预览文章",
      excerpt: "文章摘要",
      category: "制作记录",
      closingNote: "文章结尾",
      blocks: [
        block({ type: "image", imagePath: "/media/example.jpg", imageAlt: "现场图片", caption: "图片说明", sortOrder: 2 }),
        block({ type: "heading", heading: "拍摄准备", sortOrder: 0 }),
        block({ type: "paragraph", body: "第一段正文", sortOrder: 1 }),
      ],
    });

    expect(adminArticleToHomeNewsItem(source)).toMatchObject({
      title: "首页预览文章",
      excerpt: "文章摘要",
      detailParagraphs: ["第一段正文"],
      detailClosing: "文章结尾",
      detailImage: {
        alt: "现场图片",
        caption: "图片说明",
        src: "/media/example.jpg",
      },
      detailSections: [
        {
          heading: "拍摄准备",
          paragraphs: ["第一段正文"],
          image: { alt: "现场图片", src: "/media/example.jpg" },
        },
      ],
    });
  });

  it("converts stored notice settings and forces a dismissed notice to appear in preview", async () => {
    const preview = adminNoticeToPreview(notice());
    window.sessionStorage.setItem(preview.storageKey, "dismissed");

    const { rerender } = render(<SiteOpeningNotice notice={preview} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(<SiteOpeningNotice notice={preview} ignoreStoredDismissal />);
    expect(await screen.findByRole("dialog", { name: "预览公告标题" })).toBeVisible();
    expect(screen.getByText("预览公告正文")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

function article(overrides: Partial<AdminArticle> = {}): AdminArticle {
  return {
    id: "article-1",
    locale: "zh",
    slug: "article-1",
    title: "文章标题",
    excerpt: "文章摘要",
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
    status: "published",
    publishedAt: "2026-08-01T00:00:00Z",
    displayOrder: 0,
    relatedServices: [],
    seoTitle: null,
    seoDescription: null,
    youtubeUrl: null,
    demo: false,
    version: 1,
    updatedAt: "2026-08-01T00:00:00Z",
    blocks: [],
    ...overrides,
  };
}

function block(overrides: Partial<AdminArticle["blocks"][number]> = {}): AdminArticle["blocks"][number] {
  return {
    type: "paragraph",
    heading: null,
    body: null,
    imagePath: null,
    imageAlt: null,
    imageTone: "neutral",
    caption: null,
    sortOrder: 0,
    ...overrides,
  };
}

function notice(): AdminNotice {
  return {
    id: "notice-1",
    locale: "zh",
    enabled: false,
    label: "重要通知",
    title: "预览公告标题",
    body: "预览公告正文",
    dismissLabel: "关闭",
    linkLabel: null,
    linkHref: null,
    storageKey: "preview-notice-test",
    dismissalMode: "session",
    status: "draft",
    startAt: null,
    endAt: null,
    version: 1,
  };
}

const noticeContractCheck: SiteNotice = adminNoticeToPreview(notice());
void noticeContractCheck;