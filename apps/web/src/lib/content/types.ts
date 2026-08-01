import type { MediaTone, WorkMediaType } from "@/data/pages";
import type { DisplayText } from "@/lib/text/display-text";

export type Locale = "ja" | "zh" | "en";
export type PublishStatus = "draft" | "published";
export type ContentSource = "mock" | "api";

export interface MockImage {
  label: string;
  alt: string;
  tone: MediaTone;
  src?: string;
}

export interface ArticleImageBlock extends MockImage {
  caption?: string;
}

export type ArticleContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; image: ArticleImageBlock };

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  image?: ArticleImageBlock;
}

export interface Notice {
  id: string;
  language: Locale;
  title: string;
  excerpt: string;
  detailTitle: string;
  detailBody: string;
  detailLead: string;
  detailSectionTitle: string;
  detailParagraphs: string[];
  detailImage?: ArticleImageBlock;
  detailSections?: ArticleSection[];
  detailClosing: string;
  closeLabel: string;
  category: string;
  publishedAt: string;
  status: PublishStatus;
  linkHref?: string;
}

export interface SiteNotice {
  id: string;
  language: Locale;
  enabled: boolean;
  label: string;
  title: string;
  body: string;
  dismissLabel: string;
  storageKey: string;
  dismissalMode: "session" | "local";
  status: PublishStatus;
  startAt?: string;
  endAt?: string;
}

export interface Article {
  id: string;
  language: Locale;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
  status: PublishStatus;
  featuredImage: MockImage;
  body: string[];
  contentBlocks: ArticleContentBlock[];
  relatedServices: string[];
  seoTitle: string;
  seoDescription: string;
  youtubeUrl?: string;
}

export interface Work {
  id: string;
  language: Locale;
  slug: string;
  title: string;
  summary: string;
  clientName: string;
  projectDate: string;
  category: string;
  serviceCategory: "featured" | "event" | "space" | "interview" | "portrait" | "video";
  scope: string;
  challenge: string;
  approach: string[];
  outcome: string;
  deliverables: string[];
  status: PublishStatus;
  featuredOnHomepage: boolean;
  featuredOrder: number;
  featuredImage: MockImage;
  galleryImages: MockImage[];
  mediaType: WorkMediaType;
  seoTitle: string;
  seoDescription: string;
  youtubeUrl?: string;
}

export interface ServiceDetail {
  language: Locale;
  slug: "web-production" | "event-setup";
  eyebrow: string;
  title: DisplayText;
  description: string;
  sections: {
    label: string;
    title: DisplayText;
    text: string;
    bullets: string[];
  }[];
  ctaLabel: string;
  ctaTitle: DisplayText;
  linkLabel: string;
}
