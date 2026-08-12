import { z } from "zod";

export const localeSchema = z.enum(["ja", "zh", "en"]);
export const statusSchema = z.enum(["draft", "published", "archived"]);
export const toneSchema = z.enum(["neutral", "warm", "cool", "rust"]);
export const articleBlockTypeSchema = z.enum(["heading", "paragraph", "image"]);
export const workMediaTypeSchema = z.enum(["photo", "gallery", "video"]);
export const dismissalModeSchema = z.enum(["session", "local"]);

const optionalText = z.string().trim().optional().nullable();
const requiredText = z.string().trim().min(1, "必填");
const slugSchema = z
  .string()
  .trim()
  .min(1, "必填")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "请使用小写字母、数字和连字符。");

export const articleBlockSchema = z.object({
  id: z.string().optional(),
  type: articleBlockTypeSchema,
  heading: optionalText,
  body: optionalText,
  imagePath: optionalText,
  imageAlt: optionalText,
  imageTone: toneSchema.default("neutral"),
  caption: optionalText,
  sortOrder: z.coerce.number().int().min(0),
});

export const articleMutationSchema = z.object({
  locale: localeSchema,
  slug: slugSchema,
  title: requiredText,
  excerpt: requiredText,
  category: requiredText,
  authorName: z.string().trim().min(1).default("编辑团队"),
  heroLabel: optionalText,
  heroImagePath: optionalText,
  heroAlt: optionalText,
  heroTone: toneSchema.default("neutral"),
  heroCaption: optionalText,
  closingNote: optionalText,
  ctaLabel: optionalText,
  ctaHref: optionalText,
  status: statusSchema.default("draft"),
  publishedAt: optionalText,
  displayOrder: z.coerce.number().int().min(0).default(0),
  relatedServices: z.array(z.string().trim().min(1)).default([]),
  seoTitle: optionalText,
  seoDescription: optionalText,
  youtubeUrl: optionalText,
  blocks: z.array(articleBlockSchema).min(1, "至少需要一个内容区块。"),
});

export const noticeMutationSchema = z.object({
  locale: localeSchema,
  enabled: z.boolean().default(true),
  label: requiredText,
  title: requiredText,
  body: requiredText,
  dismissLabel: requiredText,
  linkLabel: optionalText,
  linkHref: optionalText,
  storageKey: requiredText,
  dismissalMode: dismissalModeSchema.default("session"),
  status: statusSchema.default("published"),
  startAt: optionalText,
  endAt: optionalText,
});

export const workImageSchema = z.object({
  id: z.string().optional(),
  path: requiredText,
  label: requiredText,
  tone: toneSchema.default("neutral"),
  altJa: optionalText,
  altZh: optionalText,
  altEn: optionalText,
  captionJa: optionalText,
  captionZh: optionalText,
  captionEn: optionalText,
  isCover: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0),
});

export const workImagesMutationSchema = z.object({
  galleryEnabled: z.boolean().default(false),
  mediaType: workMediaTypeSchema.optional(),
  images: z.array(workImageSchema).default([]),
});

export function nullable(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function optionalDate(value?: string | null) {
  const trimmed = nullable(value);
  return trimmed ? new Date(trimmed) : null;
}
