import type { AdminWorkImagesFormValues } from "@/components/admin/AdminWorkImagesForm";

type WorkImageFormItem = NonNullable<AdminWorkImagesFormValues["images"]>[number];

type WorkForImageForm = {
  mediaType: string;
  galleryEnabled: boolean;
  images: {
    path: string;
    label: string;
    tone: string;
    altJa: string | null;
    altZh: string | null;
    altEn: string | null;
    captionJa: string | null;
    captionZh: string | null;
    captionEn: string | null;
    isCover: boolean;
    sortOrder: number;
  }[];
};

export function workToImageFormValues(work: WorkForImageForm): AdminWorkImagesFormValues {
  return {
    mediaType: work.mediaType as AdminWorkImagesFormValues["mediaType"],
    galleryEnabled: work.mediaType === "video" ? false : work.galleryEnabled,
    images: work.images.map((image) => ({
      path: image.path,
      label: image.label,
      tone: image.tone as WorkImageFormItem["tone"],
      altJa: image.altJa || "",
      altZh: image.altZh || "",
      altEn: image.altEn || "",
      captionJa: image.captionJa || "",
      captionZh: image.captionZh || "",
      captionEn: image.captionEn || "",
      isCover: image.isCover,
      sortOrder: image.sortOrder,
    })),
  };
}
