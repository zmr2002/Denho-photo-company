import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const outputDirectory = resolve("..", "api", "src", "main", "resources", "content-migration");

function stableUuid(value: string) {
  const bytes = Buffer.from(createHash("sha256").update(value).digest().subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function parseStringList(value: string) {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
    throw new Error("Expected a JSON string list in the SQLite content database");
  }
  return parsed;
}

function containsFixtureText(value: unknown): boolean {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return normalized.includes("testcontext") || normalized.includes("local database") || normalized.includes("local cms");
  }
  if (Array.isArray(value)) {
    return value.some(containsFixtureText);
  }
  if (value && typeof value === "object") {
    return Object.values(value).some(containsFixtureText);
  }
  return false;
}

async function exportContent() {
  const [articles, works, notices] = await Promise.all([
    prisma.article.findMany({ include: { blocks: { orderBy: { sortOrder: "asc" } } } }),
    prisma.work.findMany({ include: { images: { orderBy: { sortOrder: "asc" } } } }),
    prisma.openingNotice.findMany(),
  ]);

  const exportedArticles = articles
    .filter((article) => article.slug !== "test" && article.slug !== "production-planning")
    .map((article) => ({
      id: stableUuid(`article:${article.locale}:${article.slug}`),
      translationGroupId: stableUuid(`article-group:${article.slug}`),
      locale: article.locale,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      authorName: article.authorName,
      heroLabel: article.heroLabel,
      heroImagePath: article.heroImagePath,
      heroAlt: article.heroAlt,
      heroTone: article.heroTone,
      heroCaption: article.heroCaption,
      closingNote: article.closingNote,
      ctaLabel: article.ctaLabel,
      ctaHref: article.ctaHref,
      status: article.status.toUpperCase(),
      publishedAt: article.publishedAt?.toISOString() ?? null,
      displayOrder: article.displayOrder,
      relatedServices: parseStringList(article.relatedServices),
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      youtubeUrl: article.youtubeUrl,
      demo: article.slug === "admin-tutorial-sample",
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      blocks: article.blocks.map((block) => ({
        id: stableUuid(`article-block:${article.locale}:${article.slug}:${block.sortOrder}`),
        blockType: block.type,
        heading: block.heading,
        body: block.body,
        imagePath: block.imagePath,
        imageAlt: block.imageAlt,
        imageTone: block.imageTone,
        caption: block.caption,
        sortOrder: block.sortOrder,
        createdAt: block.createdAt.toISOString(),
        updatedAt: block.updatedAt.toISOString(),
      })),
    }))
    .filter((article) => !containsFixtureText(article));

  const exportedWorks = works
    .filter((work) => !["gallery-test", "photo-test", "video-test"].includes(work.slug))
    .map((work) => ({
      id: stableUuid(`work:${work.locale}:${work.slug}`),
      translationGroupId: stableUuid(`work-group:${work.slug}`),
      locale: work.locale,
      slug: work.slug,
      title: work.title,
      summary: work.summary,
      clientName: work.clientName,
      projectDate: work.projectDate,
      category: work.category,
      serviceCategory: work.serviceCategory,
      scope: work.scope,
      challenge: work.challenge,
      approach: parseStringList(work.approach),
      outcome: work.outcome,
      deliverables: parseStringList(work.deliverables),
      status: work.status.toUpperCase(),
      featuredOnHomepage: work.featuredOnHomepage,
      featuredOrder: work.featuredOrder,
      mediaType: work.mediaType,
      galleryEnabled: work.galleryEnabled,
      seoTitle: work.seoTitle,
      seoDescription: work.seoDescription,
      youtubeUrl: work.youtubeUrl,
      createdAt: work.createdAt.toISOString(),
      updatedAt: work.updatedAt.toISOString(),
      images: work.images.map((image) => ({
        id: stableUuid(`work-image:${work.locale}:${work.slug}:${image.sortOrder}`),
        path: image.path,
        label: image.label,
        tone: image.tone,
        altJa: image.altJa,
        altZh: image.altZh,
        altEn: image.altEn,
        captionJa: image.captionJa,
        captionZh: image.captionZh,
        captionEn: image.captionEn,
        isCover: image.isCover,
        sortOrder: image.sortOrder,
        createdAt: image.createdAt.toISOString(),
        updatedAt: image.updatedAt.toISOString(),
      })),
    }))
    .filter((work) => !containsFixtureText(work));

  const exportedNotices = notices
    .filter((notice) => notice.title.toLowerCase() !== "test")
    .map((notice) => ({
      id: stableUuid(`notice:${notice.locale}`),
      translationGroupId: stableUuid("notice-group:opening"),
      locale: notice.locale,
      enabled: notice.enabled,
      label: notice.label,
      title: notice.title,
      body: notice.body,
      dismissLabel: notice.dismissLabel,
      linkLabel: notice.linkLabel,
      linkHref: notice.linkHref,
      storageKey: notice.storageKey,
      dismissalMode: notice.dismissalMode,
      status: notice.status.toUpperCase(),
      startAt: notice.startAt?.toISOString() ?? null,
      endAt: notice.endAt?.toISOString() ?? null,
      createdAt: notice.createdAt.toISOString(),
      updatedAt: notice.updatedAt.toISOString(),
    }))
    .filter((notice) => !containsFixtureText(notice));

  const payload = {
    schemaVersion: 1,
    articles: exportedArticles,
    works: exportedWorks,
    notices: exportedNotices,
  };
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  const checksum = createHash("sha256").update(json).digest("hex");

  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(resolve(outputDirectory, "current-content.json"), json, "utf8");
  writeFileSync(resolve(outputDirectory, "current-content.sha256"), `${checksum}\n`, "utf8");

  console.log(JSON.stringify({
    articles: exportedArticles.length,
    works: exportedWorks.length,
    notices: exportedNotices.length,
    checksum,
  }));
}

exportContent()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
