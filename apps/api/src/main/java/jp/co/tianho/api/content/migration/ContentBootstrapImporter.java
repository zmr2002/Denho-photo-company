package jp.co.tianho.api.content.migration;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Component
@ConditionalOnProperty(name = "tianho.content.bootstrap.enabled", havingValue = "true")
public class ContentBootstrapImporter implements ApplicationRunner {

    private static final ClassPathResource CONTENT_RESOURCE =
            new ClassPathResource("content-migration/current-content.json");
    private static final ClassPathResource CHECKSUM_RESOURCE =
            new ClassPathResource("content-migration/current-content.sha256");

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;

    public ContentBootstrapImporter(JdbcClient jdbcClient, ObjectMapper objectMapper) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) throws Exception {
        byte[] content = CONTENT_RESOURCE.getInputStream().readAllBytes();
        String expectedChecksum = new String(
                CHECKSUM_RESOURCE.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
        String actualChecksum = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content));
        if (!MessageDigest.isEqual(
                expectedChecksum.getBytes(StandardCharsets.US_ASCII),
                actualChecksum.getBytes(StandardCharsets.US_ASCII))) {
            throw new IllegalStateException("Content migration checksum does not match");
        }

        ContentMigrationDocument document = objectMapper.readValue(content, ContentMigrationDocument.class);
        if (document.schemaVersion() != 1) {
            throw new IllegalStateException("Unsupported content migration schema version");
        }

        document.articles().forEach(this::insertArticle);
        document.works().forEach(this::insertWork);
        document.notices().forEach(this::insertNotice);
    }

    private void insertArticle(ContentMigrationDocument.ArticleRecord article) {
        jdbcClient.sql("""
                        INSERT INTO articles (
                            id, translation_group_id, locale, slug, title, excerpt, category, author_name,
                            hero_label, hero_image_path, hero_alt, hero_tone, hero_caption, closing_note,
                            cta_label, cta_href, status, published_at, display_order, related_services,
                            seo_title, seo_description, youtube_url, demo, created_at, updated_at
                        ) VALUES (
                            :id, :translationGroupId, :locale, :slug, :title, :excerpt, :category, :authorName,
                            :heroLabel, :heroImagePath, :heroAlt, :heroTone, :heroCaption, :closingNote,
                            :ctaLabel, :ctaHref, CAST(:status AS content_status), :publishedAt, :displayOrder,
                            CAST(:relatedServices AS jsonb), :seoTitle, :seoDescription, :youtubeUrl, :demo,
                            :createdAt, :updatedAt
                        )
                        ON CONFLICT (id) DO NOTHING
                        """)
                .param("id", uuid(article.id()))
                .param("translationGroupId", uuid(article.translationGroupId()))
                .param("locale", article.locale())
                .param("slug", article.slug())
                .param("title", article.title())
                .param("excerpt", article.excerpt())
                .param("category", article.category())
                .param("authorName", article.authorName())
                .param("heroLabel", article.heroLabel())
                .param("heroImagePath", article.heroImagePath())
                .param("heroAlt", article.heroAlt())
                .param("heroTone", article.heroTone())
                .param("heroCaption", article.heroCaption())
                .param("closingNote", article.closingNote())
                .param("ctaLabel", article.ctaLabel())
                .param("ctaHref", article.ctaHref())
                .param("status", article.status())
                .param("publishedAt", timestamp(article.publishedAt()))
                .param("displayOrder", article.displayOrder())
                .param("relatedServices", json(article.relatedServices()))
                .param("seoTitle", article.seoTitle())
                .param("seoDescription", article.seoDescription())
                .param("youtubeUrl", article.youtubeUrl())
                .param("demo", article.demo())
                .param("createdAt", timestamp(article.createdAt()))
                .param("updatedAt", timestamp(article.updatedAt()))
                .update();

        article.blocks().forEach(block -> insertArticleBlock(article.id(), block));
    }

    private void insertArticleBlock(String articleId, ContentMigrationDocument.ArticleBlockRecord block) {
        jdbcClient.sql("""
                        INSERT INTO article_blocks (
                            id, article_id, block_type, heading, body, image_path, image_alt,
                            image_tone, caption, sort_order, created_at, updated_at
                        ) VALUES (
                            :id, :articleId, :blockType, :heading, :body, :imagePath, :imageAlt,
                            :imageTone, :caption, :sortOrder, :createdAt, :updatedAt
                        )
                        ON CONFLICT (id) DO NOTHING
                        """)
                .param("id", uuid(block.id()))
                .param("articleId", uuid(articleId))
                .param("blockType", block.blockType())
                .param("heading", block.heading())
                .param("body", block.body())
                .param("imagePath", block.imagePath())
                .param("imageAlt", block.imageAlt())
                .param("imageTone", block.imageTone())
                .param("caption", block.caption())
                .param("sortOrder", block.sortOrder())
                .param("createdAt", timestamp(block.createdAt()))
                .param("updatedAt", timestamp(block.updatedAt()))
                .update();
    }

    private void insertWork(ContentMigrationDocument.WorkRecord work) {
        jdbcClient.sql("""
                        INSERT INTO works (
                            id, translation_group_id, locale, slug, title, summary, client_name, project_date,
                            category, service_category, scope, challenge, approach, outcome, deliverables,
                            status, featured_on_homepage, featured_order, media_type, gallery_enabled,
                            seo_title, seo_description, youtube_url, created_at, updated_at
                        ) VALUES (
                            :id, :translationGroupId, :locale, :slug, :title, :summary, :clientName, :projectDate,
                            :category, :serviceCategory, :scope, :challenge, CAST(:approach AS jsonb), :outcome,
                            CAST(:deliverables AS jsonb), CAST(:status AS content_status), :featuredOnHomepage,
                            :featuredOrder, :mediaType, :galleryEnabled, :seoTitle, :seoDescription, :youtubeUrl,
                            :createdAt, :updatedAt
                        )
                        ON CONFLICT (id) DO NOTHING
                        """)
                .param("id", uuid(work.id()))
                .param("translationGroupId", uuid(work.translationGroupId()))
                .param("locale", work.locale())
                .param("slug", work.slug())
                .param("title", work.title())
                .param("summary", work.summary())
                .param("clientName", work.clientName())
                .param("projectDate", work.projectDate())
                .param("category", work.category())
                .param("serviceCategory", work.serviceCategory())
                .param("scope", work.scope())
                .param("challenge", work.challenge())
                .param("approach", json(work.approach()))
                .param("outcome", work.outcome())
                .param("deliverables", json(work.deliverables()))
                .param("status", work.status())
                .param("featuredOnHomepage", work.featuredOnHomepage())
                .param("featuredOrder", work.featuredOrder())
                .param("mediaType", work.mediaType())
                .param("galleryEnabled", work.galleryEnabled())
                .param("seoTitle", work.seoTitle())
                .param("seoDescription", work.seoDescription())
                .param("youtubeUrl", work.youtubeUrl())
                .param("createdAt", timestamp(work.createdAt()))
                .param("updatedAt", timestamp(work.updatedAt()))
                .update();

        work.images().forEach(image -> insertWorkImage(work.id(), image));
    }

    private void insertWorkImage(String workId, ContentMigrationDocument.WorkImageRecord image) {
        jdbcClient.sql("""
                        INSERT INTO work_images (
                            id, work_id, path, label, tone, alt_ja, alt_zh, alt_en,
                            caption_ja, caption_zh, caption_en, is_cover, sort_order, created_at, updated_at
                        ) VALUES (
                            :id, :workId, :path, :label, :tone, :altJa, :altZh, :altEn,
                            :captionJa, :captionZh, :captionEn, :isCover, :sortOrder, :createdAt, :updatedAt
                        )
                        ON CONFLICT (id) DO NOTHING
                        """)
                .param("id", uuid(image.id()))
                .param("workId", uuid(workId))
                .param("path", image.path())
                .param("label", image.label())
                .param("tone", image.tone())
                .param("altJa", image.altJa())
                .param("altZh", image.altZh())
                .param("altEn", image.altEn())
                .param("captionJa", image.captionJa())
                .param("captionZh", image.captionZh())
                .param("captionEn", image.captionEn())
                .param("isCover", image.isCover())
                .param("sortOrder", image.sortOrder())
                .param("createdAt", timestamp(image.createdAt()))
                .param("updatedAt", timestamp(image.updatedAt()))
                .update();
    }

    private void insertNotice(ContentMigrationDocument.NoticeRecord notice) {
        jdbcClient.sql("""
                        INSERT INTO opening_notices (
                            id, translation_group_id, locale, enabled, label, title, body, dismiss_label,
                            link_label, link_href, storage_key, dismissal_mode, status, start_at, end_at,
                            created_at, updated_at
                        ) VALUES (
                            :id, :translationGroupId, :locale, :enabled, :label, :title, :body, :dismissLabel,
                            :linkLabel, :linkHref, :storageKey, :dismissalMode, CAST(:status AS content_status),
                            :startAt, :endAt, :createdAt, :updatedAt
                        )
                        ON CONFLICT (id) DO NOTHING
                        """)
                .param("id", uuid(notice.id()))
                .param("translationGroupId", uuid(notice.translationGroupId()))
                .param("locale", notice.locale())
                .param("enabled", notice.enabled())
                .param("label", notice.label())
                .param("title", notice.title())
                .param("body", notice.body())
                .param("dismissLabel", notice.dismissLabel())
                .param("linkLabel", notice.linkLabel())
                .param("linkHref", notice.linkHref())
                .param("storageKey", notice.storageKey())
                .param("dismissalMode", notice.dismissalMode())
                .param("status", notice.status())
                .param("startAt", timestamp(notice.startAt()))
                .param("endAt", timestamp(notice.endAt()))
                .param("createdAt", timestamp(notice.createdAt()))
                .param("updatedAt", timestamp(notice.updatedAt()))
                .update();
    }

    private String json(Object value) {
        return objectMapper.writeValueAsString(value);
    }

    private OffsetDateTime timestamp(String value) {
        return value == null ? null : OffsetDateTime.parse(value);
    }

    private UUID uuid(String value) {
        return UUID.fromString(value);
    }
}
