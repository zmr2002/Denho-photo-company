import type { ArticleContentBlock } from "@/lib/content/types";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";

interface ArticleContentProps {
  blocks: ArticleContentBlock[];
}

export function ArticleContent({ blocks }: ArticleContentProps) {
  return (
    <div className="grid gap-7 text-base leading-8 text-stone-600 md:gap-9 md:text-lg">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h2
              className="pt-4 text-2xl font-semibold leading-tight text-stone-950 md:text-3xl"
              key={block.type + "-" + index}
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "image") {
          return (
            <figure className="grid gap-3" key={block.type + "-" + index}>
              <PlaceholderMedia
                alt={block.image.alt}
                label={block.image.label}
                showLabel={false}
                size="wide"
                src={block.image.src}
                tone={block.image.tone}
              />
              {block.image.caption ? (
                <figcaption className="text-sm leading-6 text-stone-500">{block.image.caption}</figcaption>
              ) : null}
            </figure>
          );
        }

        return (
          <p className="whitespace-pre-line" key={block.type + "-" + index}>
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
