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
  .max(160, "最多 160 个字符")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "请使用小写字母、数字和连字符。");

export const articleBlockSchema = z
  .object({
    id: z.string().optional(),
    type: articleBlockTypeSchema,
    heading: optionalText.pipe(z.string().max(500).nullable().optional()),
    body: optionalText.pipe(z.string().max(20_000).nullable().optional()),
    imagePath: optionalText.pipe(z.string().max(2_048).nullable().optional()),
    imageAlt: optionalText.pipe(z.string().max(1_000).nullable().optional()),
    imageTone: toneSchema.default("neutral"),
    caption: optionalText.pipe(z.string().max(2_000).nullable().optional()),
    sortOrder: z.coerce.number().int().min(0),
  })
  .superRefine((block, context) => {
    const requiredValue = block.type === "heading" ? block.heading : block.type === "paragraph" ? block.body : block.imagePath;
    if (!requiredValue?.trim()) {
      context.addIssue({ code: "custom", message: "请填写当前区块的主要内容。" });
    }
  });

export const articleMutationSchema = z.object({
  locale: localeSchema,
  slug: slugSchema,
  title: requiredText.max(240, "最多 240 个字符"),
  excerpt: requiredText.max(10_000, "内容过长"),
  category: requiredText.max(160, "最多 160 个字符"),
  authorName: z.string().trim().min(1).max(160).default("编辑团队"),
  heroLabel: optionalText.pipe(z.string().max(240).nullable().optional()),
  heroImagePath: optionalText.pipe(z.string().max(2_048).nullable().optional()),
  heroAlt: optionalText.pipe(z.string().max(1_000).nullable().optional()),
  heroTone: toneSchema.default("neutral"),
  heroCaption: optionalText.pipe(z.string().max(2_000).nullable().optional()),
  closingNote: optionalText.pipe(z.string().max(5_000).nullable().optional()),
  ctaLabel: optionalText.pipe(z.string().max(240).nullable().optional()),
  ctaHref: optionalText.pipe(z.string().max(2_048).nullable().optional()),
  status: statusSchema.default("draft"),
  publishedAt: optionalText,
  displayOrder: z.coerce.number().int().min(0).default(0),
  relatedServices: z.array(z.string().trim().min(1).max(160)).max(40).default([]),
  seoTitle: optionalText.pipe(z.string().max(240).nullable().optional()),
  seoDescription: optionalText.pipe(z.string().max(1_000).nullable().optional()),
  youtubeUrl: optionalText.pipe(z.string().max(2_048).nullable().optional()),
  blocks: z.array(articleBlockSchema).min(1, "至少需要一个内容区块。").max(200),
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
