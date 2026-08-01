import "server-only";

import type { Article, Locale } from "@/lib/content/types";
import {
  articleImageTone,
  managedArticleImagePath,
  mapArticleContentBlocks,
} from "@/lib/content/article-content";
import type { AdminArticle } from "@/lib/api/admin";

export function adminArticleToPreview(article: AdminArticle): Article {
  const locale = previewLocale(article.locale);
  const publishedAt = article.publishedAt ? dateOnly(article.publishedAt) : draftDateLabel(locale);
  const updatedAt = article.updatedAt
    ? dateOnly(article.updatedAt)
    : article.publishedAt
      ? dateOnly(article.publishedAt)
      : publishedAt;

  return {
    id: article.id,
    language: locale,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    authorName: article.authorName,
    publishedAt,
    updatedAt,
    status: article.status === "published" ? "published" : "draft",
    featuredImage: {
      label: article.heroLabel || article.title,
      alt: article.heroAlt || article.title,
      tone: articleImageTone(article.heroTone),
      src: managedArticleImagePath(article.heroImagePath),
    },
    body: [...article.blocks]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .flatMap((block) => [block.heading, block.body].filter((value): value is string => Boolean(value))),
    contentBlocks: mapArticleContentBlocks(article.blocks, article.title),
    relatedServices: article.relatedServices,
    seoTitle: article.seoTitle || article.title,
    seoDescription: article.seoDescription || article.excerpt,
    youtubeUrl: article.youtubeUrl ?? undefined,
  };
}

function previewLocale(value: string): Locale {
  return value === "zh" || value === "en" ? value : "ja";
}

function dateOnly(value: string) {
  return value.slice(0, 10);
}

function draftDateLabel(locale: Locale) {
  if (locale === "ja") return "未公開";
  if (locale === "zh") return "未发布";
  return "Unpublished";
}
