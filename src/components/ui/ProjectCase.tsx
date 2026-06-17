import type { MediaTone } from "@/data/pages";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";

interface ProjectCaseProps {
  number?: string;
  category: string;
  title: string;
  description: string;
  scope: string;
  mediaLabel: string;
  mediaTone?: MediaTone;
  video?: boolean;
}

export function ProjectCase({
  number,
  category,
  title,
  description,
  scope,
  mediaLabel,
  mediaTone = "neutral",
  video = false,
}: ProjectCaseProps) {
  return (
    <article className="project-case">
      <PlaceholderMedia label={mediaLabel} size="panoramic" video={video} tone={mediaTone} />
      <div className="project-case-info">
        <div>
          <p className="section-label">{number ? `${number} / ${category}` : category}</p>
          <h3>{title}</h3>
        </div>
        <div>
          <p className="project-description">{description}</p>
          <p className="project-scope">{scope}</p>
        </div>
      </div>
    </article>
  );
}
