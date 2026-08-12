import type { HomeNewsItem } from "@/data/home";
import type { AdminArticleFormValues } from "@/components/admin/AdminArticleForm";
import type { Article, ArticleImageBlock, ArticleSection, Locale } from "@/lib/content/types";
import {
  articleImageTone,
  managedArticleImagePath,
  mapArticleContentBlocks,
} from "@/lib/content/article-content";
import type { AdminArticle } from "@/lib/api/admin";
import { formatSiteDate } from "@/lib/site-date";

export function adminArticleToPreview(article: AdminArticle): Article {
  const locale = previewLocale(article.locale);
  const blocks = article.blocks ?? [];
  const publishedAt = article.publishedAt ? formatSiteDate(article.publishedAt) : draftDateLabel(locale);
  const updatedAt = article.updatedAt
    ? formatSiteDate(article.updatedAt)
    : article.publishedAt
      ? formatSiteDate(article.publishedAt)
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
    body: [...blocks]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .flatMap((block) => [block.heading, block.body].filter((value): value is string => Boolean(value))),
    contentBlocks: mapArticleContentBlocks(blocks, article.title),
    relatedServices: article.relatedServices,
    seoTitle: article.seoTitle || article.title,
    seoDescription: article.seoDescription || article.excerpt,
    youtubeUrl: article.youtubeUrl ?? undefined,
  };
}

export function selectAdminArticlesForPlacement(articles: AdminArticle[], targetId: string) {
  const target = articles.find((article) => article.id === targetId);
  if (!target) return [];
  const locale = previewLocale(target.locale);

  return articles
    .filter((article) => previewLocale(article.locale) === locale)
    .filter((article) => article.id === targetId || article.status === "published")
    .sort(compareArticlePlacement);
}

export function adminArticleToHomeNewsItem(article: AdminArticle): HomeNewsItem {
  const locale = previewLocale(article.locale);
  const blocks = [...(article.blocks ?? [])].sort((left, right) => left.sortOrder - right.sortOrder);
  const paragraphs = blocks.map((block) => block.body).filter((value): value is string => Boolean(value));
  const imageBlock = blocks.find((block) => block.imagePath);

  return {
    date: article.publishedAt ? formatSiteDate(article.publishedAt) : draftDateLabel(locale),
    category: article.category,
    title: article.title,
    excerpt: article.excerpt,
    detailTitle: article.title,
    detailBody: paragraphs.join("\n\n") || article.excerpt,
    detailLead: article.excerpt,
    detailSectionTitle: article.category,
    detailParagraphs: paragraphs.length > 0 ? paragraphs : [article.excerpt],
    detailImage: imageBlock ? previewBlockImage(imageBlock, article.title) : undefined,
    detailSections: previewArticleSections(blocks),
    detailClosing: article.closingNote || "",
    closeLabel: locale === "ja" ? "閉じる" : locale === "zh" ? "关闭" : "Close",
  };
}

function compareArticlePlacement(left: AdminArticle, right: AdminArticle) {
  const orderDifference = left.displayOrder - right.displayOrder;
  if (orderDifference !== 0) return orderDifference;

  if (!left.publishedAt && right.publishedAt) return -1;
  if (left.publishedAt && !right.publishedAt) return 1;
  const dateDifference = (right.publishedAt || "").localeCompare(left.publishedAt || "");
  return dateDifference || left.id.localeCompare(right.id);
}

function previewArticleSections(blocks: AdminArticle["blocks"]): ArticleSection[] {
  const sections: ArticleSection[] = [];
  for (const block of blocks) {
    if (block.heading) {
      sections.push({ heading: block.heading, paragraphs: [] });
      continue;
    }
    const current = sections.at(-1);
    if (!current) continue;
    if (block.body) current.paragraphs.push(block.body);
    if (block.imagePath && !current.image) current.image = previewBlockImage(block, current.heading);
  }
  return sections;
}

function previewBlockImage(block: AdminArticle["blocks"][number], fallback: string): ArticleImageBlock {
  return {
    label: block.heading || fallback,
    alt: block.imageAlt || fallback,
    tone: articleImageTone(block.imageTone),
    caption: block.caption ?? undefined,
    src: managedArticleImagePath(block.imagePath),
  };
}

function previewLocale(value: string): Locale {
  return value === "zh" || value === "en" ? value : "ja";
}

function draftDateLabel(locale: Locale) {
  if (locale === "ja") return "未公開";
  if (locale === "zh") return "未发布";
  return "Unpublished";
}

export function articleFormValuesToPreview(values: AdminArticleFormValues, id = "unsaved-preview"): Article {
  const excerpt = values.excerpt?.trim()
    || values.blocks.find((block) => block.type === "paragraph" && block.body?.trim())?.body?.trim()
    || values.title.trim()
    || "未填写摘要";
  return adminArticleToPreview({
    id,
    locale: values.locale,
    slug: values.slug || "preview",
    title: values.title || "未填写标题",
    excerpt,
    category: values.category || "未分类",
    authorName: values.authorName || "编辑团队",
    heroLabel: values.heroLabel || null,
    heroImagePath: values.heroImagePath || null,
    heroAlt: values.heroAlt || null,
    heroTone: values.heroTone || "neutral",
    heroCaption: values.heroCaption || null,
    closingNote: values.closingNote || null,
    ctaLabel: values.ctaLabel || null,
    ctaHref: values.ctaHref || null,
    status: values.status || "draft",
    publishedAt: values.publishedAt || null,
    displayOrder: typeof values.displayOrder === "number" ? values.displayOrder : 0,
    relatedServices: (values.relatedServicesText || "").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean),
    seoTitle: values.seoTitle || null,
    seoDescription: values.seoDescription || null,
    youtubeUrl: values.youtubeUrl || null,
    demo: false,
    version: 0,
    blocks: values.blocks.map((block, index) => ({
      type: block.type,
      heading: block.heading || null,
      body: block.body || null,
      imagePath: block.imagePath || null,
      imageAlt: block.imageAlt || null,
      imageTone: block.imageTone || "neutral",
      caption: block.caption || null,
      sortOrder: index,
    })),
  });
}
