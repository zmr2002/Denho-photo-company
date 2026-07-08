import type { MediaTone } from "@/data/pages";
import type { GalleryImage } from "@/data/pages";
import type { DisplayText } from "@/lib/text/display-text";
import { PortfolioGallery } from "@/components/ui/PortfolioGallery";

interface ProjectCaseProps {
  number?: string;
  category: string;
  title: DisplayText;
  description: string;
  scope: string;
  mediaLabel: string;
  mediaTone?: MediaTone;
  video?: boolean;
  galleryImages?: GalleryImage[];
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
  galleryImages,
}: ProjectCaseProps) {
  return (
    <PortfolioGallery
      variant="project"
      number={number}
      category={category}
      title={title}
      description={description}
      scope={scope}
      mediaLabel={mediaLabel}
      mediaTone={mediaTone}
      video={video}
      galleryImages={galleryImages}
    />
  );
}
