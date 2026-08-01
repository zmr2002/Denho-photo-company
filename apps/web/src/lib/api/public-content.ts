import "server-only";

import createClient from "openapi-fetch";
import { z } from "zod";
import type { paths } from "@/generated/api-schema";
import { mapArticleContentBlocks } from "@/lib/content/article-content";
import type {
  Article,
  ArticleSection,
  Locale,
  MockImage,
  Notice,
  SiteNotice,
  Work,
} from "@/lib/content/types";

const apiBaseUrl = process.env.API_INTERNAL_URL || "http://127.0.0.1:8080";
const requestTimeoutMs = 5_000;

const publicFetch: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    cache: "no-store",
    signal: init?.signal ?? AbortSignal.timeout(requestTimeoutMs),
  });

const publicApi = createClient<paths>({ baseUrl: apiBaseUrl, fetch: publicFetch });

const localeSchema = z.enum(["ja", "zh", "en"]);
const toneSchema = z.enum(["warm", "cool", "rust", "neutral"]);
const serviceCategorySchema = z.enum(["featured", "event", "space", "interview", "portrait", "video"]);
const mediaTypeSchema = z.enum(["photo", "gallery", "video"]);
const nullableString = z.string().nullable().optional();

const articleSummarySchema = z.object({
  id: z.string().uuid(),
  locale: localeSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string(),
  category: z.string(),
  authorName: z.string(),
  heroImagePath: nullableString,
  heroAlt: nullableString,
  heroTone: z.string(),
  publishedAt: z.string(),
  displayOrder: z.number().int(),
  demo: z.boolean(),
});

const articleBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  heading: nullableString,
  body: nullableString,
  imagePath: nullableString,
  imageAlt: nullableString,
  imageTone: z.string(),
  caption: nullableString,
  sortOrder: z.number().int(),
});

const articleDetailSchema = z.object({
  id: z.string().uuid(),
  translationGroupId: z.string().uuid(),
  locale: localeSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string(),
  category: z.string(),
  authorName: z.string(),
  heroLabel: nullableString,
  heroImagePath: nullableString,
  heroAlt: nullableString,
  heroTone: z.string(),
  heroCaption: nullableString,
  closingNote: nullableString,
  ctaLabel: nullableString,
  ctaHref: nullableString,
  publishedAt: z.string(),
  relatedServices: z.array(z.string()),
  seoTitle: nullableString,
  seoDescription: nullableString,
  youtubeUrl: nullableString,
  demo: z.boolean(),
  version: z.number().int().nonnegative(),
  updatedAt: z.string(),
  blocks: z.array(articleBlockSchema),
});

const workSummarySchema = z.object({
  id: z.string().uuid(),
  locale: localeSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  category: z.string(),
  serviceCategory: serviceCategorySchema,
  featuredOnHomepage: z.boolean(),
  featuredOrder: z.number().int(),
  mediaType: mediaTypeSchema,
  coverImagePath: nullableString,
  coverImageAlt: nullableString,
  coverImageTone: z.string(),
});

const workImageSchema = z.object({
  id: z.string().uuid(),
  path: z.string().min(1),
  label: z.string(),
  tone: z.string(),
  alt: nullableString,
  caption: nullableString,
  cover: z.boolean(),
  sortOrder: z.number().int(),
});

const workDetailSchema = z.object({
  id: z.string().uuid(),
  translationGroupId: z.string().uuid(),
  locale: localeSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  clientName: z.string(),
  projectDate: z.string(),
  category: z.string(),
  serviceCategory: serviceCategorySchema,
  scope: z.string(),
  challenge: z.string(),
  approach: z.array(z.string()),
  outcome: z.string(),
  deliverables: z.array(z.string()),
  featuredOnHomepage: z.boolean(),
  featuredOrder: z.number().int(),
  mediaType: mediaTypeSchema,
  galleryEnabled: z.boolean(),
  seoTitle: nullableString,
  seoDescription: nullableString,
  youtubeUrl: nullableString,
  version: z.number().int().nonnegative(),
  updatedAt: z.string(),
  images: z.array(workImageSchema),
});

const noticeSchema = z.object({
  id: z.string().uuid(),
  translationGroupId: z.string().uuid(),
  locale: localeSchema,
  label: z.string(),
  title: z.string(),
  body: z.string(),
  dismissLabel: z.string(),
  linkLabel: nullableString,
  linkHref: nullableString,
  storageKey: z.string(),
  dismissalMode: z.enum(["session", "local"]),
  startAt: nullableString,
  endAt: nullableString,
  version: z.number().int().nonnegative(),
});

type ArticleSummaryContract = z.infer<typeof articleSummarySchema>;
type ArticleDetailContract = z.infer<typeof articleDetailSchema>;
type ArticleBlockContract = z.infer<typeof articleBlockSchema>;
type WorkDetailContract = z.infer<typeof workDetailSchema>;

export class PublicContentApiError extends Error {
  constructor(path: string, status: number) {
    super(`Public content API returned ${status} for ${path}`);
    this.name = "PublicContentApiError";
  }
}

export async function getApiArticles(locale: Locale): Promise<Article[]> {
  const { data, response } = await publicApi.GET("/api/v1/public/articles", {
    params: { query: { locale } },
  });
  requireSuccess(response, "/api/v1/public/articles");
  return z.array(articleSummarySchema).parse(data).map(mapArticleSummary);
}

export async function getApiArticle(locale: Locale, slug: string): Promise<Article | undefined> {
  const path = "/api/v1/public/articles/{slug}";
  const { data, response } = await publicApi.GET(path, {
    params: { path: { slug }, query: { locale } },
  });
  if (response.status === 404) return undefined;
  requireSuccess(response, path);
  return mapArticleDetail(articleDetailSchema.parse(data));
}

export async function getApiNotices(locale: Locale): Promise<Notice[]> {
  const summaries = await getApiArticleSummaries(locale);
  const details = await Promise.all(summaries.slice(0, 3).map((summary) => getRequiredArticle(locale, summary.slug)));
  return details.map(mapArticleNotice);
}

export async function getApiOpeningNotice(locale: Locale): Promise<SiteNotice | undefined> {
  const path = "/api/v1/public/notices/current";
  const { data, response } = await publicApi.GET(path, {
    params: { query: { locale } },
  });
  if (response.status === 204) return undefined;
  requireSuccess(response, path);
  const notice = noticeSchema.parse(data);
  return {
    id: notice.id,
    language: notice.locale,
    enabled: true,
    label: notice.label,
    title: notice.title,
    body: notice.body,
    dismissLabel: notice.dismissLabel,
    storageKey: notice.storageKey,
    dismissalMode: notice.dismissalMode,
    status: "published",
    startAt: notice.startAt ?? undefined,
    endAt: notice.endAt ?? undefined,
  };
}

export async function getApiWorks(locale: Locale): Promise<Work[]> {
  const path = "/api/v1/public/works";
  const { data, response } = await publicApi.GET(path, {
    params: { query: { locale } },
  });
  requireSuccess(response, path);
  const summaries = z.array(workSummarySchema).parse(data);
  return Promise.all(summaries.map((summary) => getRequiredWork(locale, summary.slug)));
}

export async function getApiWork(locale: Locale, slug: string): Promise<Work | undefined> {
  const path = "/api/v1/public/works/{slug}";
  const { data, response } = await publicApi.GET(path, {
    params: { path: { slug }, query: { locale } },
  });
  if (response.status === 404) return undefined;
  requireSuccess(response, path);
  return mapWork(workDetailSchema.parse(data));
}

async function getApiArticleSummaries(locale: Locale) {
  const path = "/api/v1/public/articles";
  const { data, response } = await publicApi.GET(path, {
    params: { query: { locale } },
  });
  requireSuccess(response, path);
  return z.array(articleSummarySchema).parse(data);
}

async function getRequiredArticle(locale: Locale, slug: string) {
  const article = await getApiArticleContract(locale, slug);
  if (!article) throw new PublicContentApiError(`/api/v1/public/articles/${slug}`, 502);
  return article;
}

async function getApiArticleContract(locale: Locale, slug: string) {
  const path = "/api/v1/public/articles/{slug}";
  const { data, response } = await publicApi.GET(path, {
    params: { path: { slug }, query: { locale } },
  });
  if (response.status === 404) return undefined;
  requireSuccess(response, path);
  return articleDetailSchema.parse(data);
}

async function getRequiredWork(locale: Locale, slug: string) {
  const work = await getApiWork(locale, slug);
  if (!work) throw new PublicContentApiError(`/api/v1/public/works/${slug}`, 502);
  return work;
}

function mapArticleSummary(article: ArticleSummaryContract): Article {
  return {
    id: article.id,
    language: article.locale,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    authorName: article.authorName,
    publishedAt: dateOnly(article.publishedAt),
    updatedAt: dateOnly(article.publishedAt),
    status: "published",
    featuredImage: {
      label: article.title,
      alt: article.heroAlt || article.title,
      tone: imageTone(article.heroTone),
      src: managedImagePath(article.heroImagePath),
    },
    body: [],
    contentBlocks: [],
    relatedServices: [],
    seoTitle: article.title,
    seoDescription: article.excerpt,
  };
}

function mapArticleDetail(article: ArticleDetailContract): Article {
  const blocks = sortedBlocks(article.blocks);
  return {
    id: article.id,
    language: article.locale,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    authorName: article.authorName,
    publishedAt: dateOnly(article.publishedAt),
    updatedAt: dateOnly(article.updatedAt),
    status: "published",
    featuredImage: {
      label: article.heroLabel || article.title,
      alt: article.heroAlt || article.title,
      tone: imageTone(article.heroTone),
      src: managedImagePath(article.heroImagePath),
    },
    body: blocks.flatMap((block) => [block.heading, block.body].filter((value): value is string => Boolean(value))),
    contentBlocks: mapArticleContentBlocks(blocks, article.title),
    relatedServices: article.relatedServices,
    seoTitle: article.seoTitle || article.title,
    seoDescription: article.seoDescription || article.excerpt,
    youtubeUrl: article.youtubeUrl ?? undefined,
  };
}

function mapArticleNotice(article: ArticleDetailContract): Notice {
  const blocks = sortedBlocks(article.blocks);
  const paragraphs = blocks.map((block) => block.body).filter((value): value is string => Boolean(value));
  const imageBlock = blocks.find((block) => block.imagePath);
  return {
    id: article.id,
    language: article.locale,
    title: article.title,
    excerpt: article.excerpt,
    detailTitle: article.title,
    detailBody: paragraphs.join("\n\n") || article.excerpt,
    detailLead: article.excerpt,
    detailSectionTitle: article.category,
    detailParagraphs: paragraphs.length > 0 ? paragraphs : [article.excerpt],
    detailImage: imageBlock ? blockImage(imageBlock, article.title) : undefined,
    detailSections: articleSections(blocks),
    detailClosing: article.closingNote || "",
    closeLabel: article.locale === "ja" ? "閉じる" : article.locale === "zh" ? "关闭" : "Close",
    category: article.category,
    publishedAt: dateOnly(article.publishedAt),
    status: "published",
    linkHref: article.ctaHref ?? undefined,
  };
}

function mapWork(work: WorkDetailContract): Work {
  const images = [...work.images].sort((left, right) => left.sortOrder - right.sortOrder);
  const cover = images.find((image) => image.cover) || images[0];
  const featuredImage: MockImage = cover
    ? mapWorkImage(cover)
    : { label: work.title, alt: work.title, tone: "neutral" };
  return {
    id: work.id,
    language: work.locale,
    slug: work.slug,
    title: work.title,
    summary: work.summary,
    clientName: work.clientName,
    projectDate: work.projectDate,
    category: work.category,
    serviceCategory: work.serviceCategory,
    scope: work.scope,
    challenge: work.challenge,
    approach: work.approach,
    outcome: work.outcome,
    deliverables: work.deliverables,
    status: "published",
    featuredOnHomepage: work.featuredOnHomepage,
    featuredOrder: work.featuredOrder,
    featuredImage,
    galleryImages: images.map(mapWorkImage),
    mediaType: work.mediaType,
    seoTitle: work.seoTitle || work.title,
    seoDescription: work.seoDescription || work.summary,
    youtubeUrl: work.youtubeUrl ?? undefined,
  };
}

function mapWorkImage(image: z.infer<typeof workImageSchema>): MockImage {
  return {
    label: image.label,
    alt: image.alt || image.label,
    tone: imageTone(image.tone),
    src: managedImagePath(image.path),
  };
}

function articleSections(blocks: ArticleBlockContract[]): ArticleSection[] {
  const sections: ArticleSection[] = [];
  for (const block of blocks) {
    if (block.heading) {
      sections.push({ heading: block.heading, paragraphs: [] });
      continue;
    }
    const current = sections.at(-1);
    if (!current) continue;
    if (block.body) current.paragraphs.push(block.body);
    if (block.imagePath && !current.image) current.image = blockImage(block, current.heading);
  }
  return sections;
}

function blockImage(block: ArticleBlockContract, fallback: string) {
  return {
    label: block.heading || fallback,
    alt: block.imageAlt || fallback,
    tone: imageTone(block.imageTone),
    caption: block.caption ?? undefined,
    src: managedImagePath(block.imagePath),
  };
}

function sortedBlocks(blocks: ArticleBlockContract[]) {
  return [...blocks].sort((left, right) => left.sortOrder - right.sortOrder);
}

function imageTone(value: string): MockImage["tone"] {
  const result = toneSchema.safeParse(value);
  return result.success ? result.data : "neutral";
}

function managedImagePath(value: string | null | undefined) {
  return value?.startsWith("/media/") ? value : undefined;
}

function dateOnly(value: string) {
  return value.slice(0, 10);
}

function requireSuccess(response: Response, path: string) {
  if (!response.ok) throw new PublicContentApiError(path, response.status);
}
