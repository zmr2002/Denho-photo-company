import type { WorkCase } from "@/data/pages";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";

export function WorkCaseCard({
  title,
  description,
  scope,
  mediaLabel,
  mediaTone,
  mediaType,
}: WorkCase) {
  const typeLabel = mediaType.toUpperCase();

  return (
    <article className="work-case-card">
      <div className={`work-case-media work-case-media-${mediaType}`}>
        <PlaceholderMedia
          label={mediaLabel}
          size="wide"
          tone={mediaTone}
          video={mediaType === "video"}
        />
        <span className="work-media-type">{typeLabel}</span>
        {mediaType === "gallery" ? <span className="gallery-count">01 / 06</span> : null}
      </div>
      <div className="work-case-copy">
        <p>{scope}</p>
        <h3>{title}</h3>
        <div>{description}</div>
      </div>
    </article>
  );
}
