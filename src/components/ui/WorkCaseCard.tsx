import type { WorkCase } from "@/data/pages";
import { PortfolioGallery } from "@/components/ui/PortfolioGallery";

export function WorkCaseCard(workCase: WorkCase) {
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
    />
  );
}
