import type { MediaTone } from "@/data/pages";
import Image from "next/image";

type PlaceholderSize = "small" | "standard" | "wide" | "panoramic" | "hero";

interface PlaceholderMediaProps {
  label: string;
  size?: PlaceholderSize;
  video?: boolean;
  dark?: boolean;
  tone?: MediaTone;
  showLabel?: boolean;
  src?: string;
  alt?: string;
}

const sizeClasses: Record<PlaceholderSize, string> = {
  small: "aspect-[4/3]",
  standard: "aspect-[4/3] md:aspect-[16/10]",
  wide: "aspect-[16/9]",
  panoramic: "aspect-[16/9] md:aspect-[21/9]",
  hero: "min-h-[72svh] md:min-h-[82svh]",
};

export function PlaceholderMedia({
  label,
  size = "standard",
  video = false,
  dark = false,
  tone = "neutral",
  showLabel = true,
  src,
  alt,
}: PlaceholderMediaProps) {
  const className = [
    "placeholder-media group relative flex items-end overflow-hidden p-5 md:p-8",
    sizeClasses[size],
    dark ? "placeholder-media-dark" : "",
    `placeholder-tone-${tone}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} role={src ? undefined : "img"} aria-label={src ? undefined : `${label} placeholder`}>
      {src ? <Image alt={alt || label} className="object-cover" fill sizes="(max-width: 768px) 100vw, 75vw" src={src} /> : null}
      <div className="placeholder-frame" aria-hidden="true" />
      {video ? (
        <div className="video-mark" aria-hidden="true">
          <span>▶</span>
        </div>
      ) : null}
      {showLabel ? <span className="placeholder-label">{label}</span> : null}
    </div>
  );
}
