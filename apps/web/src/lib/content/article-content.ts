import type { MediaTone } from "@/data/pages";
import type { ArticleContentBlock } from "@/lib/content/types";

export interface ArticleContentSourceBlock {
  type: string;
  heading?: string | null;
  body?: string | null;
  imagePath?: string | null;
  imageAlt?: string | null;
  imageTone: string;
  caption?: string | null;
  sortOrder: number;
}

export function mapArticleContentBlocks(
  sourceBlocks: ArticleContentSourceBlock[],
  fallbackLabel: string,
): ArticleContentBlock[] {
  const blocks = [...sourceBlocks].sort((left, right) => left.sortOrder - right.sortOrder);

  return blocks.flatMap((block) => {
    if (block.type === "heading" && block.heading) {
      return [{ type: "heading" as const, text: block.heading }];
    }
    if (block.type === "paragraph" && block.body) {
      return [{ type: "paragraph" as const, text: block.body }];
    }
    if (block.type === "image" && block.imagePath) {
      return [{ type: "image" as const, image: articleBlockImage(block, fallbackLabel) }];
    }

    const compatibleBlocks: ArticleContentBlock[] = [];
    if (block.heading) compatibleBlocks.push({ type: "heading", text: block.heading });
    if (block.body) compatibleBlocks.push({ type: "paragraph", text: block.body });
    if (block.imagePath) {
      compatibleBlocks.push({ type: "image", image: articleBlockImage(block, fallbackLabel) });
    }
    return compatibleBlocks;
  });
}

export function managedArticleImagePath(value: string | null | undefined) {
  return value?.startsWith("/media/") ? value : undefined;
}

export function articleImageTone(value: string): MediaTone {
  return value === "warm" || value === "cool" || value === "rust" || value === "neutral"
    ? value
    : "neutral";
}

function articleBlockImage(block: ArticleContentSourceBlock, fallbackLabel: string) {
  return {
    label: block.heading || fallbackLabel,
    alt: block.imageAlt || fallbackLabel,
    tone: articleImageTone(block.imageTone),
    caption: block.caption ?? undefined,
    src: managedArticleImagePath(block.imagePath),
  };
}
