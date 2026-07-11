import type { Article, ArticleSection, Locale, MockImage, Notice, SiteNotice, Work } from "@/lib/content/types";
import { prisma } from "@/lib/db/prisma";

export async function getDbArticles(locale: Locale): Promise<Article[]> {
  const articles = await prisma.article.findMany({
    where: { locale, status: "published" },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }],
  });

  return articles.map((article) => ({
    id: article.id,
    language: article.locale as Locale,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    authorName: article.authorName,
    publishedAt: dateString(article.publishedAt || article.createdAt),
    updatedAt: dateString(article.updatedAt),
    status: "published",
    featuredImage: imageFromArticle(article),
    body: article.blocks.flatMap((block) => {
      if (block.type === "heading" && block.heading) return [block.heading];
      if (block.body) return [block.body];
      return [];
    }),
    relatedServices: parseList(article.relatedServices),
    seoTitle: article.seoTitle || article.title,
    seoDescription: article.seoDescription || article.excerpt,
    youtubeUrl: article.youtubeUrl || undefined,
  }));
}

export async function getDbNotices(locale: Locale): Promise<Notice[]> {
  const articles = await prisma.article.findMany({
    where: { locale, status: "published" },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }],
    take: 3,
  });

  return articles.map((article) => {
    const paragraphs = article.blocks
      .filter((block) => block.type !== "image" && (block.body || block.heading))
      .map((block) => block.body || block.heading || "");
    const imageBlock = article.blocks.find((block) => block.type === "image" && block.imagePath);
    const detailSections: ArticleSection[] = article.blocks
      .filter((block) => block.type === "heading" && block.heading)
      .map((block) => ({ heading: block.heading || article.title, paragraphs: [] }));

    return {
      id: article.id,
      language: article.locale as Locale,
      title: article.title,
      excerpt: article.excerpt,
      detailTitle: article.title,
      detailBody: paragraphs.join("\n\n") || article.excerpt,
      detailLead: article.excerpt,
      detailSectionTitle: article.category,
      detailParagraphs: paragraphs.length > 0 ? paragraphs : [article.excerpt],
      detailImage: imageBlock
        ? {
            label: imageBlock.heading || article.title,
            alt: imageBlock.imageAlt || article.title,
            tone: tone(imageBlock.imageTone),
            caption: imageBlock.caption || undefined,
            src: managedImagePath(imageBlock.imagePath),
          }
        : undefined,
      detailSections,
      detailClosing: article.closingNote || "",
      closeLabel: locale === "en" ? "Close" : locale === "zh" ? "Close" : "Close",
      category: article.category,
      publishedAt: dateString(article.publishedAt || article.createdAt),
      status: "published",
      linkHref: article.ctaHref || undefined,
    };
  });
}

export async function getDbOpeningNotice(locale: Locale): Promise<SiteNotice | undefined> {
  const now = new Date();
  const notice = await prisma.openingNotice.findFirst({
    where: {
      locale,
      enabled: true,
      status: "published",
      OR: [{ startAt: null }, { startAt: { lte: now } }],
      AND: [{ OR: [{ endAt: null }, { endAt: { gte: now } }] }],
    },
  });

  if (!notice) return undefined;

  return {
    id: notice.id,
    language: notice.locale as Locale,
    enabled: notice.enabled,
    label: notice.label,
    title: notice.title,
    body: notice.body,
    dismissLabel: notice.dismissLabel,
    storageKey: notice.storageKey,
    dismissalMode: notice.dismissalMode === "local" ? "local" : "session",
    status: "published",
    startAt: notice.startAt ? dateString(notice.startAt) : undefined,
    endAt: notice.endAt ? dateString(notice.endAt) : undefined,
  };
}

export async function getDbWorks(locale: Locale): Promise<Work[]> {
  const works = await prisma.work.findMany({
    where: { locale, status: "published" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ featuredOrder: "asc" }, { updatedAt: "desc" }],
  });

  return works.map((work) => {
    const cover = work.images.find((image) => image.isCover) || work.images[0];
    const featuredImage: MockImage = cover
      ? {
          label: cover.label,
          alt: localizedAlt(locale, cover) || cover.label,
          tone: tone(cover.tone),
          src: managedImagePath(cover.path),
        }
      : { label: work.title, alt: work.title, tone: "neutral" };

    return {
      id: work.id,
      language: work.locale as Locale,
      slug: work.slug,
      title: work.title,
      summary: work.summary,
      clientName: work.clientName,
      projectDate: work.projectDate,
      category: work.category,
      serviceCategory: work.serviceCategory as Work["serviceCategory"],
      scope: work.scope,
      challenge: work.challenge,
      approach: parseList(work.approach),
      outcome: work.outcome,
      deliverables: parseList(work.deliverables),
      status: "published",
      featuredOnHomepage: work.featuredOnHomepage,
      featuredOrder: work.featuredOrder,
      featuredImage,
      galleryImages: work.images.map((image) => ({
        label: image.label,
        alt: localizedAlt(locale, image) || image.label,
        tone: tone(image.tone),
        src: managedImagePath(image.path),
      })),
      mediaType: work.mediaType as Work["mediaType"],
      seoTitle: work.seoTitle || work.title,
      seoDescription: work.seoDescription || work.summary,
      youtubeUrl: work.youtubeUrl || undefined,
    };
  });
}

function imageFromArticle(article: {
  title: string;
  heroLabel: string | null;
  heroAlt: string | null;
  heroTone: string;
  heroImagePath: string | null;
}): MockImage {
  return {
    label: article.heroLabel || article.title,
    alt: article.heroAlt || article.title,
    tone: tone(article.heroTone),
    src: managedImagePath(article.heroImagePath),
  };
}

function managedImagePath(path: string | null) {
  return path?.startsWith("/media/original/") ? path : undefined;
}

function localizedAlt(locale: Locale, image: { altJa: string | null; altZh: string | null; altEn: string | null }) {
  if (locale === "ja") return image.altJa;
  if (locale === "zh") return image.altZh;
  return image.altEn;
}

function tone(value: string): MockImage["tone"] {
  return value === "warm" || value === "cool" || value === "rust" || value === "neutral" ? value : "neutral";
}

function parseList(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function dateString(date: Date) {
  return date.toISOString().slice(0, 10);
}
