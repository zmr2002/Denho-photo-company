package jp.co.tianho.api.content.publicapi;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public final class PublicContentResponse {

    private PublicContentResponse() {
    }

    public record ArticleSummary(
            UUID id,
            String locale,
            String slug,
            String title,
            String excerpt,
            String category,
            String authorName,
            String heroImagePath,
            String heroAlt,
            String heroTone,
            OffsetDateTime publishedAt,
            int displayOrder,
            boolean demo) {
    }

    public record ArticleDetail(
            UUID id,
            UUID translationGroupId,
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
            OffsetDateTime publishedAt,
            List<String> relatedServices,
            String seoTitle,
            String seoDescription,
            String youtubeUrl,
            boolean demo,
            long version,
            OffsetDateTime updatedAt,
            List<ArticleBlock> blocks) {
    }

    public record ArticleBlock(
            UUID id,
            String type,
            String heading,
            String body,
            String imagePath,
            String imageAlt,
            String imageTone,
            String caption,
            int sortOrder) {
    }

    public record WorkSummary(
            UUID id,
            String locale,
            String slug,
            String title,
            String summary,
            String category,
            String serviceCategory,
            String scope,
            boolean featuredOnHomepage,
            int featuredOrder,
            String mediaType,
            boolean galleryEnabled,
            String coverImagePath,
            String coverImageAlt,
            String coverImageTone,
            List<WorkImage> images) {
    }

    public record WorkDetail(
            UUID id,
            UUID translationGroupId,
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
            boolean featuredOnHomepage,
            int featuredOrder,
            String mediaType,
            boolean galleryEnabled,
            String seoTitle,
            String seoDescription,
            String youtubeUrl,
            long version,
            OffsetDateTime updatedAt,
            List<WorkImage> images) {
    }

    public record WorkImage(
            UUID id,
            String path,
            String label,
            String tone,
            String alt,
            String caption,
            boolean cover,
            int sortOrder) {
    }

    public record Notice(
            UUID id,
            UUID translationGroupId,
            String locale,
            String label,
            String title,
            String body,
            String dismissLabel,
            String linkLabel,
            String linkHref,
            String storageKey,
            String dismissalMode,
            OffsetDateTime startAt,
            OffsetDateTime endAt,
            long version) {
    }
}
