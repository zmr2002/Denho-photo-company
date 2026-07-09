import type { AdminArticleFormValues } from "@/components/admin/AdminArticleForm";

type ArticleForForm = {
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  heroLabel: string | null;
  heroImagePath: string | null;
  heroAlt: string | null;
  heroTone: string;
  heroCaption: string | null;
  closingNote: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  status: string;
  publishedAt: Date | null;
  displayOrder: number;
  relatedServices: string;
  seoTitle: string | null;
  seoDescription: string | null;
  youtubeUrl: string | null;
  blocks: {
    type: string;
    heading: string | null;
    body: string | null;
    imagePath: string | null;
    imageAlt: string | null;
    imageTone: string;
    caption: string | null;
    sortOrder: number;
  }[];
};

export function blankArticleFormValues(): AdminArticleFormValues {
  return {
    locale: "ja",
    slug: "new-article",
    title: "",
    excerpt: "",
    category: "Notice",
    authorName: "Editorial Team",
    heroLabel: "",
    heroImagePath: "",
    heroAlt: "",
    heroTone: "neutral",
    heroCaption: "",
    closingNote: "",
    ctaLabel: "",
    ctaHref: "",
    status: "draft",
    publishedAt: "",
    displayOrder: 0,
    relatedServicesText: "",
    seoTitle: "",
    seoDescription: "",
    youtubeUrl: "",
    blocks: [{ type: "paragraph", body: "", heading: "", imagePath: "", imageAlt: "", imageTone: "neutral", caption: "", sortOrder: 0 }],
  };
}

export function articleToFormValues(article: ArticleForForm): AdminArticleFormValues {
  return {
    locale: article.locale as AdminArticleFormValues["locale"],
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    authorName: article.authorName,
    heroLabel: article.heroLabel || "",
    heroImagePath: article.heroImagePath || "",
    heroAlt: article.heroAlt || "",
    heroTone: article.heroTone as AdminArticleFormValues["heroTone"],
    heroCaption: article.heroCaption || "",
    closingNote: article.closingNote || "",
    ctaLabel: article.ctaLabel || "",
    ctaHref: article.ctaHref || "",
    status: article.status as AdminArticleFormValues["status"],
    publishedAt: article.publishedAt ? article.publishedAt.toISOString().slice(0, 10) : "",
    displayOrder: article.displayOrder,
    relatedServicesText: parseList(article.relatedServices).join("\n"),
    seoTitle: article.seoTitle || "",
    seoDescription: article.seoDescription || "",
    youtubeUrl: article.youtubeUrl || "",
    blocks: article.blocks.map((block) => ({
      type: block.type as AdminArticleFormValues["blocks"][number]["type"],
      heading: block.heading || "",
      body: block.body || "",
      imagePath: block.imagePath || "",
      imageAlt: block.imageAlt || "",
      imageTone: block.imageTone as AdminArticleFormValues["blocks"][number]["imageTone"],
      caption: block.caption || "",
      sortOrder: block.sortOrder,
    })),
  };
}

function parseList(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
