import type { WorkCase } from "@/data/pages";
import { PortfolioGallery, type GalleryControlLabels } from "@/components/ui/PortfolioGallery";

interface WorkCaseCardProps extends WorkCase {
  galleryLabels?: GalleryControlLabels;
}

export function WorkCaseCard(workCase: WorkCaseCardProps) {
  return (
    <PortfolioGallery
      variant="work"
      category={workCase.category ?? workCase.scope}
      title={workCase.title}
      description={workCase.description}
      scope={workCase.scope}
      mediaLabel={workCase.mediaLabel}
      mediaTone={workCase.mediaTone}
      mediaType={workCase.mediaType}
      galleryImages={workCase.galleryImages}
      galleryLabels={workCase.galleryLabels}
    />
  );
}
