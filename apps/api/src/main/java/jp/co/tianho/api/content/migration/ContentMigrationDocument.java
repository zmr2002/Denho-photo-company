package jp.co.tianho.api.content.migration;

import java.util.List;

record ContentMigrationDocument(
        int schemaVersion,
        List<ArticleRecord> articles,
        List<WorkRecord> works,
        List<NoticeRecord> notices) {

    record ArticleRecord(
            String id,
            String translationGroupId,
            String locale,
            String slug,
            String title,
            String excerpt,
            String category,
            String authorName,
            String heroLabel,
            String heroImagePath,
            String heroAlt,
            String heroTone,
            String heroCaption,
            String closingNote,
            String ctaLabel,
            String ctaHref,
            String status,
            String publishedAt,
            int displayOrder,
            List<String> relatedServices,
            String seoTitle,
            String seoDescription,
            String youtubeUrl,
            boolean demo,
            String createdAt,
            String updatedAt,
            List<ArticleBlockRecord> blocks) {
    }

    record ArticleBlockRecord(
            String id,
            String blockType,
            String heading,
            String body,
            String imagePath,
            String imageAlt,
            String imageTone,
            String caption,
            int sortOrder,
            String createdAt,
            String updatedAt) {
    }

    record WorkRecord(
            String id,
            String translationGroupId,
            String locale,
            String slug,
            String title,
            String summary,
            String clientName,
            String projectDate,
            String category,
            String serviceCategory,
            String scope,
            String challenge,
            List<String> approach,
            String outcome,
            List<String> deliverables,
            String status,
            boolean featuredOnHomepage,
            int featuredOrder,
            String mediaType,
            boolean galleryEnabled,
            String seoTitle,
            String seoDescription,
            String youtubeUrl,
            String createdAt,
            String updatedAt,
            List<WorkImageRecord> images) {
    }

    record WorkImageRecord(
            String id,
            String path,
            String label,
            String tone,
            String altJa,
            String altZh,
            String altEn,
            String captionJa,
            String captionZh,
            String captionEn,
            boolean isCover,
            int sortOrder,
            String createdAt,
            String updatedAt) {
    }

    record NoticeRecord(
            String id,
            String translationGroupId,
            String locale,
            boolean enabled,
            String label,
            String title,
            String body,
            String dismissLabel,
            String linkLabel,
            String linkHref,
            String storageKey,
            String dismissalMode,
            String status,
            String startAt,
            String endAt,
            String createdAt,
            String updatedAt) {
    }
}
