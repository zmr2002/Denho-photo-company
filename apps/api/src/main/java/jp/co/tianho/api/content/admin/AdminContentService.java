package jp.co.tianho.api.content.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.sql.Types;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import jp.co.tianho.api.auth.AdministratorPrincipal;
import jp.co.tianho.api.content.admin.ContentRevisionService.ResourceType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class AdminContentService {

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;
    private final ContentRevisionService revisionService;

    public AdminContentService(
            JdbcClient jdbcClient,
            ObjectMapper objectMapper,
            ContentRevisionService revisionService) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
        this.revisionService = revisionService;
    }

    @Transactional(readOnly = true)
    public List<JsonNode> findAll(ResourceType resourceType) {
        String statement = switch (resourceType) {
            case ARTICLE -> "SELECT to_jsonb(item) FROM (SELECT * FROM articles ORDER BY locale, display_order, updated_at DESC) item";
            case WORK -> """
                    SELECT to_jsonb(work) || jsonb_build_object(
                        'images', COALESCE((SELECT jsonb_agg(to_jsonb(image) ORDER BY image.sort_order, image.id)
                            FROM work_images image WHERE image.work_id = work.id), '[]'::jsonb))
                    FROM works work ORDER BY work.locale, work.featured_order, work.updated_at DESC
                    """;
            case NOTICE -> "SELECT to_jsonb(item) FROM (SELECT * FROM opening_notices ORDER BY locale) item";
        };
        return jdbcClient.sql(statement)
                .query(String.class)
                .list()
                .stream()
                .map(objectMapper::readTree)
                .toList();
    }

    @Transactional(readOnly = true)
    public JsonNode findOne(ResourceType resourceType, UUID id) {
        String statement = switch (resourceType) {
            case ARTICLE -> """
                    SELECT to_jsonb(article) || jsonb_build_object(
                        'blocks', COALESCE((SELECT jsonb_agg(to_jsonb(block) ORDER BY block.sort_order, block.id)
                            FROM article_blocks block WHERE block.article_id = article.id), '[]'::jsonb))
                    FROM articles article WHERE article.id = :id
                    """;
            case WORK -> """
                    SELECT to_jsonb(work) || jsonb_build_object(
                        'images', COALESCE((SELECT jsonb_agg(to_jsonb(image) ORDER BY image.sort_order, image.id)
                            FROM work_images image WHERE image.work_id = work.id), '[]'::jsonb))
                    FROM works work WHERE work.id = :id
                    """;
            case NOTICE -> "SELECT to_jsonb(notice) FROM opening_notices notice WHERE notice.id = :id";
        };
        return jdbcClient.sql(statement)
                .param("id", id)
                .query(String.class)
                .optional()
                .map(objectMapper::readTree)
                .orElseThrow(() -> notFound());
    }

    @Transactional
    public JsonNode createArticle(
            ArticleInput input,
            AdministratorPrincipal actor,
            String ipAddress) {
        UUID id = UUID.randomUUID();
        jdbcClient.sql("""
                        INSERT INTO articles (
                            id, translation_group_id, locale, slug, title, excerpt, category, author_name,
                            hero_label, hero_image_path, hero_alt, hero_tone, hero_caption, closing_note,
                            cta_label, cta_href, status, display_order, related_services, seo_title,
                            seo_description, youtube_url, demo
                        ) VALUES (
                            :id, :translationGroupId, :locale, :slug, :title, :excerpt, :category, :authorName,
                            :heroLabel, :heroImagePath, :heroAlt, :heroTone, :heroCaption, :closingNote,
                            :ctaLabel, :ctaHref, 'DRAFT', :displayOrder, CAST(:relatedServices AS jsonb),
                            :seoTitle, :seoDescription, :youtubeUrl, :demo
                        )
                        """)
                .param("id", id)
                .param("translationGroupId", UUID.randomUUID())
                .param("locale", input.locale())
                .param("slug", input.slug())
                .param("title", input.title())
                .param("excerpt", input.excerpt())
                .param("category", input.category())
                .param("authorName", input.authorName())
                .param("heroLabel", input.heroLabel(), Types.VARCHAR)
                .param("heroImagePath", input.heroImagePath(), Types.VARCHAR)
                .param("heroAlt", input.heroAlt(), Types.VARCHAR)
                .param("heroTone", input.heroTone())
                .param("heroCaption", input.heroCaption(), Types.VARCHAR)
                .param("closingNote", input.closingNote(), Types.VARCHAR)
                .param("ctaLabel", input.ctaLabel(), Types.VARCHAR)
                .param("ctaHref", input.ctaHref(), Types.VARCHAR)
                .param("displayOrder", input.displayOrder())
                .param("relatedServices", objectMapper.writeValueAsString(input.relatedServices()))
                .param("seoTitle", input.seoTitle(), Types.VARCHAR)
                .param("seoDescription", input.seoDescription(), Types.VARCHAR)
                .param("youtubeUrl", input.youtubeUrl(), Types.VARCHAR)
                .param("demo", input.demo())
                .update();
        replaceArticleBlocks(id, input.blocks());
        revisionService.recordChange(ResourceType.ARTICLE, id, "CREATED", actor, ipAddress);
        return findOne(ResourceType.ARTICLE, id);
    }

    @Transactional
    public JsonNode updateArticle(
            UUID id,
            ArticleInput input,
            long expectedVersion,
            AdministratorPrincipal actor,
            String ipAddress) {
        requireEditable(ResourceType.ARTICLE, id, expectedVersion, actor);
        int updated = jdbcClient.sql("""
                        UPDATE articles SET
                            locale = :locale, slug = :slug, title = :title, excerpt = :excerpt,
                            category = :category, author_name = :authorName, hero_label = :heroLabel,
                            hero_image_path = :heroImagePath, hero_alt = :heroAlt, hero_tone = :heroTone,
                            hero_caption = :heroCaption, closing_note = :closingNote, cta_label = :ctaLabel,
                            cta_href = :ctaHref, display_order = :displayOrder,
                            related_services = CAST(:relatedServices AS jsonb), seo_title = :seoTitle,
                            seo_description = :seoDescription, youtube_url = :youtubeUrl, demo = :demo,
                            version = version + 1, updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id AND version = :expectedVersion
                        """)
                .param("id", id)
                .param("expectedVersion", expectedVersion)
                .param("locale", input.locale())
                .param("slug", input.slug())
                .param("title", input.title())
                .param("excerpt", input.excerpt())
                .param("category", input.category())
                .param("authorName", input.authorName())
                .param("heroLabel", input.heroLabel(), Types.VARCHAR)
                .param("heroImagePath", input.heroImagePath(), Types.VARCHAR)
                .param("heroAlt", input.heroAlt(), Types.VARCHAR)
                .param("heroTone", input.heroTone())
                .param("heroCaption", input.heroCaption(), Types.VARCHAR)
                .param("closingNote", input.closingNote(), Types.VARCHAR)
                .param("ctaLabel", input.ctaLabel(), Types.VARCHAR)
                .param("ctaHref", input.ctaHref(), Types.VARCHAR)
                .param("displayOrder", input.displayOrder())
                .param("relatedServices", objectMapper.writeValueAsString(input.relatedServices()))
                .param("seoTitle", input.seoTitle(), Types.VARCHAR)
                .param("seoDescription", input.seoDescription(), Types.VARCHAR)
                .param("youtubeUrl", input.youtubeUrl(), Types.VARCHAR)
                .param("demo", input.demo())
                .update();
        requireUpdated(updated);
        replaceArticleBlocks(id, input.blocks());
        revisionService.recordChange(ResourceType.ARTICLE, id, "UPDATED", actor, ipAddress);
        return findOne(ResourceType.ARTICLE, id);
    }

    @Transactional
    public JsonNode saveNotice(
            NoticeInput input,
            AdministratorPrincipal actor,
            String ipAddress) {
        JsonNode existing = jdbcClient.sql("SELECT to_jsonb(notice) FROM opening_notices notice WHERE locale = :locale")
                .param("locale", input.locale())
                .query(String.class)
                .optional()
                .map(objectMapper::readTree)
                .orElse(null);
        UUID id;
        String action;
        if (existing == null) {
            id = UUID.randomUUID();
            jdbcClient.sql("""
                            INSERT INTO opening_notices (
                                id, translation_group_id, locale, enabled, label, title, body, dismiss_label,
                                link_label, link_href, storage_key, dismissal_mode, status, start_at, end_at
                            ) VALUES (
                                :id, :translationGroupId, :locale, :enabled, :label, :title, :body, :dismissLabel,
                                :linkLabel, :linkHref, :storageKey, :dismissalMode, 'DRAFT', :startAt, :endAt
                            )
                            """)
                    .param("id", id)
                    .param("translationGroupId", UUID.randomUUID())
                    .param("locale", input.locale())
                    .param("enabled", input.enabled())
                    .param("label", input.label())
                    .param("title", input.title())
                    .param("body", input.body())
                    .param("dismissLabel", input.dismissLabel())
                    .param("linkLabel", input.linkLabel(), Types.VARCHAR)
                    .param("linkHref", input.linkHref(), Types.VARCHAR)
                    .param("storageKey", input.storageKey())
                    .param("dismissalMode", input.dismissalMode())
                    .param("startAt", input.startAt(), Types.TIMESTAMP_WITH_TIMEZONE)
                    .param("endAt", input.endAt(), Types.TIMESTAMP_WITH_TIMEZONE)
                    .update();
            action = "CREATED";
        } else {
            id = UUID.fromString(existing.get("id").stringValue());
            requireEditable(ResourceType.NOTICE, id, input.expectedVersion(), actor);
            int updated = jdbcClient.sql("""
                            UPDATE opening_notices SET enabled = :enabled, label = :label, title = :title,
                                body = :body, dismiss_label = :dismissLabel, link_label = :linkLabel,
                                link_href = :linkHref, storage_key = :storageKey, dismissal_mode = :dismissalMode,
                                start_at = :startAt, end_at = :endAt, version = version + 1,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = :id AND version = :expectedVersion
                            """)
                    .param("id", id)
                    .param("expectedVersion", input.expectedVersion())
                    .param("enabled", input.enabled())
                    .param("label", input.label())
                    .param("title", input.title())
                    .param("body", input.body())
                    .param("dismissLabel", input.dismissLabel())
                    .param("linkLabel", input.linkLabel(), Types.VARCHAR)
                    .param("linkHref", input.linkHref(), Types.VARCHAR)
                    .param("storageKey", input.storageKey())
                    .param("dismissalMode", input.dismissalMode())
                    .param("startAt", input.startAt(), Types.TIMESTAMP_WITH_TIMEZONE)
                    .param("endAt", input.endAt(), Types.TIMESTAMP_WITH_TIMEZONE)
                    .update();
            requireUpdated(updated);
            action = "UPDATED";
        }
        revisionService.recordChange(ResourceType.NOTICE, id, action, actor, ipAddress);
        return findOne(ResourceType.NOTICE, id);
    }

    @Transactional
    public JsonNode updateWorkImages(
            UUID id,
            WorkImagesInput input,
            AdministratorPrincipal actor,
            String ipAddress) {
        requireEditable(ResourceType.WORK, id, input.expectedVersion(), actor);
        int updated = jdbcClient.sql("""
                        UPDATE works SET media_type = :mediaType, gallery_enabled = :galleryEnabled,
                            version = version + 1, updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id AND version = :expectedVersion
                        """)
                .param("id", id)
                .param("expectedVersion", input.expectedVersion())
                .param("mediaType", input.mediaType())
                .param("galleryEnabled", !"video".equals(input.mediaType()) && input.galleryEnabled())
                .update();
        requireUpdated(updated);
        jdbcClient.sql("DELETE FROM work_images WHERE work_id = :id").param("id", id).update();
        for (int index = 0; index < input.images().size(); index++) {
            WorkImageInput image = input.images().get(index);
            jdbcClient.sql("""
                            INSERT INTO work_images (
                                work_id, path, label, tone, alt_ja, alt_zh, alt_en,
                                caption_ja, caption_zh, caption_en, is_cover, sort_order
                            ) VALUES (
                                :workId, :path, :label, :tone, :altJa, :altZh, :altEn,
                                :captionJa, :captionZh, :captionEn, :cover, :sortOrder
                            )
                            """)
                    .param("workId", id)
                    .param("path", image.path())
                    .param("label", image.label())
                    .param("tone", image.tone())
                    .param("altJa", image.altJa(), Types.VARCHAR)
                    .param("altZh", image.altZh(), Types.VARCHAR)
                    .param("altEn", image.altEn(), Types.VARCHAR)
                    .param("captionJa", image.captionJa(), Types.VARCHAR)
                    .param("captionZh", image.captionZh(), Types.VARCHAR)
                    .param("captionEn", image.captionEn(), Types.VARCHAR)
                    .param("cover", image.isCover() || index == 0 && input.images().stream().noneMatch(WorkImageInput::isCover))
                    .param("sortOrder", image.sortOrder())
                    .update();
        }
        revisionService.recordChange(ResourceType.WORK, id, "UPDATED", actor, ipAddress);
        return findOne(ResourceType.WORK, id);
    }

    private void replaceArticleBlocks(UUID articleId, List<ArticleBlockInput> blocks) {
        jdbcClient.sql("DELETE FROM article_blocks WHERE article_id = :articleId")
                .param("articleId", articleId)
                .update();
        for (ArticleBlockInput block : blocks) {
            jdbcClient.sql("""
                            INSERT INTO article_blocks (
                                article_id, block_type, heading, body, image_path, image_alt,
                                image_tone, caption, sort_order
                            ) VALUES (
                                :articleId, :blockType, :heading, :body, :imagePath, :imageAlt,
                                :imageTone, :caption, :sortOrder
                            )
                            """)
                    .param("articleId", articleId)
                    .param("blockType", block.type())
                    .param("heading", block.heading(), Types.VARCHAR)
                    .param("body", block.body(), Types.VARCHAR)
                    .param("imagePath", block.imagePath(), Types.VARCHAR)
                    .param("imageAlt", block.imageAlt(), Types.VARCHAR)
                    .param("imageTone", block.imageTone())
                    .param("caption", block.caption(), Types.VARCHAR)
                    .param("sortOrder", block.sortOrder())
                    .update();
        }
    }

    private void requireEditable(ResourceType type, UUID id, long expectedVersion, AdministratorPrincipal actor) {
        JsonNode current = findOne(type, id);
        if (current.get("version").longValue() != expectedVersion) {
            throw conflict();
        }
        if (!"ADMIN".equals(actor.role()) && !"DRAFT".equals(current.get("status").stringValue())) {
            throw new ContentRevisionException(
                    ContentRevisionException.Reason.CONFLICT, "Editors can only modify draft content");
        }
    }

    private void requireUpdated(int updated) {
        if (updated != 1) {
            throw conflict();
        }
    }

    private ContentRevisionException conflict() {
        return new ContentRevisionException(
                ContentRevisionException.Reason.CONFLICT, "Content changed after it was loaded");
    }

    private ContentRevisionException notFound() {
        return new ContentRevisionException(ContentRevisionException.Reason.NOT_FOUND, "Content was not found");
    }

    public record ArticleInput(
            @NotBlank @Pattern(regexp = "ja|zh|en") String locale,
            @NotBlank @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
            @NotBlank String title,
            @NotBlank String excerpt,
            @NotBlank String category,
            @NotBlank String authorName,
            String heroLabel,
            String heroImagePath,
            String heroAlt,
            @NotBlank @Pattern(regexp = "neutral|warm|cool|rust") String heroTone,
            String heroCaption,
            String closingNote,
            String ctaLabel,
            String ctaHref,
            @Min(0) int displayOrder,
            @NotNull List<@NotBlank String> relatedServices,
            String seoTitle,
            String seoDescription,
            String youtubeUrl,
            boolean demo,
            @NotNull @Size(min = 1) List<@Valid ArticleBlockInput> blocks) {
    }

    public record ArticleBlockInput(
            @NotBlank @Pattern(regexp = "heading|paragraph|image") String type,
            String heading,
            String body,
            String imagePath,
            String imageAlt,
            @NotBlank @Pattern(regexp = "neutral|warm|cool|rust") String imageTone,
            String caption,
            @Min(0) int sortOrder) {
    }

    public record NoticeInput(
            @NotBlank @Pattern(regexp = "ja|zh|en") String locale,
            boolean enabled,
            @NotBlank String label,
            @NotBlank String title,
            @NotBlank String body,
            @NotBlank String dismissLabel,
            String linkLabel,
            String linkHref,
            @NotBlank String storageKey,
            @NotBlank @Pattern(regexp = "session|local") String dismissalMode,
            OffsetDateTime startAt,
            OffsetDateTime endAt,
            long expectedVersion) {
    }

    public record WorkImagesInput(
            long expectedVersion,
            boolean galleryEnabled,
            @NotBlank @Pattern(regexp = "photo|gallery|video") String mediaType,
            @NotNull List<@Valid WorkImageInput> images) {
    }

    public record WorkImageInput(
            @NotBlank String path,
            @NotBlank String label,
            @NotBlank @Pattern(regexp = "neutral|warm|cool|rust") String tone,
            String altJa,
            String altZh,
            String altEn,
            String captionJa,
            String captionZh,
            String captionEn,
            boolean isCover,
            @Min(0) int sortOrder) {
    }
}
