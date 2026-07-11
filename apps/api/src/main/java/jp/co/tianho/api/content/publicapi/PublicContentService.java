package jp.co.tianho.api.content.publicapi;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Service
@Transactional(readOnly = true)
public class PublicContentService {

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;

    public PublicContentService(JdbcClient jdbcClient, ObjectMapper objectMapper) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
    }

    public List<PublicContentResponse.ArticleSummary> findArticles(String locale) {
        return jdbcClient.sql("""
                        SELECT id, locale, slug, title, excerpt, category, author_name,
                               hero_image_path, hero_alt, hero_tone, published_at, display_order, demo
                        FROM articles
                        WHERE locale = :locale AND status = 'PUBLISHED'
                        ORDER BY display_order ASC, published_at DESC, id ASC
                        """)
                .param("locale", locale)
                .query(this::mapArticleSummary)
                .list();
    }

    public PublicContentResponse.ArticleDetail findArticle(String locale, String slug) {
        PublicContentResponse.ArticleDetail article = jdbcClient.sql("""
                        SELECT id, translation_group_id, locale, slug, title, excerpt, category, author_name,
                               hero_label, hero_image_path, hero_alt, hero_tone, hero_caption, closing_note,
                               cta_label, cta_href, published_at, related_services, seo_title, seo_description,
                               youtube_url, demo, version, updated_at
                        FROM articles
                        WHERE locale = :locale AND slug = :slug AND status = 'PUBLISHED'
                        """)
                .param("locale", locale)
                .param("slug", slug)
                .query((resultSet, rowNumber) -> mapArticleDetail(resultSet, List.of()))
                .optional()
                .orElseThrow(() -> new ContentNotFoundException("article", locale, slug));

        List<PublicContentResponse.ArticleBlock> blocks = jdbcClient.sql("""
                        SELECT id, block_type, heading, body, image_path, image_alt,
                               image_tone, caption, sort_order
                        FROM article_blocks
                        WHERE article_id = :articleId
                        ORDER BY sort_order ASC, id ASC
                        """)
                .param("articleId", article.id())
                .query(this::mapArticleBlock)
                .list();
        return new PublicContentResponse.ArticleDetail(
                article.id(), article.translationGroupId(), article.locale(), article.slug(), article.title(),
                article.excerpt(), article.category(), article.authorName(), article.heroLabel(),
                article.heroImagePath(), article.heroAlt(), article.heroTone(), article.heroCaption(),
                article.closingNote(), article.ctaLabel(), article.ctaHref(), article.publishedAt(),
                article.relatedServices(), article.seoTitle(), article.seoDescription(), article.youtubeUrl(),
                article.demo(), article.version(), article.updatedAt(), blocks);
    }

    public List<PublicContentResponse.WorkSummary> findWorks(String locale) {
        return jdbcClient.sql("""
                        SELECT w.id, w.locale, w.slug, w.title, w.summary, w.category, w.service_category,
                               w.featured_on_homepage, w.featured_order, w.media_type,
                               cover.path AS cover_image_path,
                               CASE w.locale WHEN 'ja' THEN cover.alt_ja WHEN 'zh' THEN cover.alt_zh ELSE cover.alt_en END
                                   AS cover_image_alt,
                               cover.tone AS cover_image_tone
                        FROM works w
                        LEFT JOIN LATERAL (
                            SELECT path, alt_ja, alt_zh, alt_en, tone
                            FROM work_images
                            WHERE work_id = w.id
                            ORDER BY is_cover DESC, sort_order ASC, id ASC
                            LIMIT 1
                        ) cover ON TRUE
                        WHERE w.locale = :locale AND w.status = 'PUBLISHED'
                        ORDER BY w.featured_order ASC, w.id ASC
                        """)
                .param("locale", locale)
                .query(this::mapWorkSummary)
                .list();
    }

    public PublicContentResponse.WorkDetail findWork(String locale, String slug) {
        PublicContentResponse.WorkDetail work = jdbcClient.sql("""
                        SELECT id, translation_group_id, locale, slug, title, summary, client_name, project_date,
                               category, service_category, scope, challenge, approach, outcome, deliverables,
                               featured_on_homepage, featured_order, media_type, gallery_enabled, seo_title,
                               seo_description, youtube_url, version, updated_at
                        FROM works
                        WHERE locale = :locale AND slug = :slug AND status = 'PUBLISHED'
                        """)
                .param("locale", locale)
                .param("slug", slug)
                .query((resultSet, rowNumber) -> mapWorkDetail(resultSet, List.of()))
                .optional()
                .orElseThrow(() -> new ContentNotFoundException("work", locale, slug));

        List<PublicContentResponse.WorkImage> images = jdbcClient.sql("""
                        SELECT id, path, label, tone,
                               CASE :locale WHEN 'ja' THEN alt_ja WHEN 'zh' THEN alt_zh ELSE alt_en END AS alt,
                               CASE :locale WHEN 'ja' THEN caption_ja WHEN 'zh' THEN caption_zh ELSE caption_en END AS caption,
                               is_cover, sort_order
                        FROM work_images
                        WHERE work_id = :workId
                        ORDER BY sort_order ASC, id ASC
                        """)
                .param("locale", locale)
                .param("workId", work.id())
                .query(this::mapWorkImage)
                .list();
        return new PublicContentResponse.WorkDetail(
                work.id(), work.translationGroupId(), work.locale(), work.slug(), work.title(), work.summary(),
                work.clientName(), work.projectDate(), work.category(), work.serviceCategory(), work.scope(),
                work.challenge(), work.approach(), work.outcome(), work.deliverables(), work.featuredOnHomepage(),
                work.featuredOrder(), work.mediaType(), work.galleryEnabled(), work.seoTitle(), work.seoDescription(),
                work.youtubeUrl(), work.version(), work.updatedAt(), images);
    }

    public Optional<PublicContentResponse.Notice> findCurrentNotice(String locale) {
        return jdbcClient.sql("""
                        SELECT id, translation_group_id, locale, label, title, body, dismiss_label,
                               link_label, link_href, storage_key, dismissal_mode, start_at, end_at, version
                        FROM opening_notices
                        WHERE locale = :locale
                          AND status = 'PUBLISHED'
                          AND enabled = TRUE
                          AND (start_at IS NULL OR start_at <= CURRENT_TIMESTAMP)
                          AND (end_at IS NULL OR end_at > CURRENT_TIMESTAMP)
                        ORDER BY start_at DESC NULLS LAST, id ASC
                        LIMIT 1
                        """)
                .param("locale", locale)
                .query(this::mapNotice)
                .optional();
    }

    private PublicContentResponse.ArticleSummary mapArticleSummary(ResultSet resultSet, int rowNumber)
            throws SQLException {
        return new PublicContentResponse.ArticleSummary(
                resultSet.getObject("id", UUID.class),
                resultSet.getString("locale"),
                resultSet.getString("slug"),
                resultSet.getString("title"),
                resultSet.getString("excerpt"),
                resultSet.getString("category"),
                resultSet.getString("author_name"),
                resultSet.getString("hero_image_path"),
                resultSet.getString("hero_alt"),
                resultSet.getString("hero_tone"),
                resultSet.getObject("published_at", OffsetDateTime.class),
                resultSet.getInt("display_order"),
                resultSet.getBoolean("demo"));
    }

    private PublicContentResponse.ArticleDetail mapArticleDetail(
            ResultSet resultSet, List<PublicContentResponse.ArticleBlock> blocks) throws SQLException {
        return new PublicContentResponse.ArticleDetail(
                resultSet.getObject("id", UUID.class),
                resultSet.getObject("translation_group_id", UUID.class),
                resultSet.getString("locale"),
                resultSet.getString("slug"),
                resultSet.getString("title"),
                resultSet.getString("excerpt"),
                resultSet.getString("category"),
                resultSet.getString("author_name"),
                resultSet.getString("hero_label"),
                resultSet.getString("hero_image_path"),
                resultSet.getString("hero_alt"),
                resultSet.getString("hero_tone"),
                resultSet.getString("hero_caption"),
                resultSet.getString("closing_note"),
                resultSet.getString("cta_label"),
                resultSet.getString("cta_href"),
                resultSet.getObject("published_at", OffsetDateTime.class),
                readStringList(resultSet.getString("related_services")),
                resultSet.getString("seo_title"),
                resultSet.getString("seo_description"),
                resultSet.getString("youtube_url"),
                resultSet.getBoolean("demo"),
                resultSet.getLong("version"),
                resultSet.getObject("updated_at", OffsetDateTime.class),
                blocks);
    }

    private PublicContentResponse.ArticleBlock mapArticleBlock(ResultSet resultSet, int rowNumber)
            throws SQLException {
        return new PublicContentResponse.ArticleBlock(
                resultSet.getObject("id", UUID.class),
                resultSet.getString("block_type"),
                resultSet.getString("heading"),
                resultSet.getString("body"),
                resultSet.getString("image_path"),
                resultSet.getString("image_alt"),
                resultSet.getString("image_tone"),
                resultSet.getString("caption"),
                resultSet.getInt("sort_order"));
    }

    private PublicContentResponse.WorkSummary mapWorkSummary(ResultSet resultSet, int rowNumber)
            throws SQLException {
        return new PublicContentResponse.WorkSummary(
                resultSet.getObject("id", UUID.class),
                resultSet.getString("locale"),
                resultSet.getString("slug"),
                resultSet.getString("title"),
                resultSet.getString("summary"),
                resultSet.getString("category"),
                resultSet.getString("service_category"),
                resultSet.getBoolean("featured_on_homepage"),
                resultSet.getInt("featured_order"),
                resultSet.getString("media_type"),
                resultSet.getString("cover_image_path"),
                resultSet.getString("cover_image_alt"),
                resultSet.getString("cover_image_tone"));
    }

    private PublicContentResponse.WorkDetail mapWorkDetail(
            ResultSet resultSet, List<PublicContentResponse.WorkImage> images) throws SQLException {
        return new PublicContentResponse.WorkDetail(
                resultSet.getObject("id", UUID.class),
                resultSet.getObject("translation_group_id", UUID.class),
                resultSet.getString("locale"),
                resultSet.getString("slug"),
                resultSet.getString("title"),
                resultSet.getString("summary"),
                resultSet.getString("client_name"),
                resultSet.getString("project_date"),
                resultSet.getString("category"),
                resultSet.getString("service_category"),
                resultSet.getString("scope"),
                resultSet.getString("challenge"),
                readStringList(resultSet.getString("approach")),
                resultSet.getString("outcome"),
                readStringList(resultSet.getString("deliverables")),
                resultSet.getBoolean("featured_on_homepage"),
                resultSet.getInt("featured_order"),
                resultSet.getString("media_type"),
                resultSet.getBoolean("gallery_enabled"),
                resultSet.getString("seo_title"),
                resultSet.getString("seo_description"),
                resultSet.getString("youtube_url"),
                resultSet.getLong("version"),
                resultSet.getObject("updated_at", OffsetDateTime.class),
                images);
    }

    private PublicContentResponse.WorkImage mapWorkImage(ResultSet resultSet, int rowNumber) throws SQLException {
        return new PublicContentResponse.WorkImage(
                resultSet.getObject("id", UUID.class),
                resultSet.getString("path"),
                resultSet.getString("label"),
                resultSet.getString("tone"),
                resultSet.getString("alt"),
                resultSet.getString("caption"),
                resultSet.getBoolean("is_cover"),
                resultSet.getInt("sort_order"));
    }

    private PublicContentResponse.Notice mapNotice(ResultSet resultSet, int rowNumber) throws SQLException {
        return new PublicContentResponse.Notice(
                resultSet.getObject("id", UUID.class),
                resultSet.getObject("translation_group_id", UUID.class),
                resultSet.getString("locale"),
                resultSet.getString("label"),
                resultSet.getString("title"),
                resultSet.getString("body"),
                resultSet.getString("dismiss_label"),
                resultSet.getString("link_label"),
                resultSet.getString("link_href"),
                resultSet.getString("storage_key"),
                resultSet.getString("dismissal_mode"),
                resultSet.getObject("start_at", OffsetDateTime.class),
                resultSet.getObject("end_at", OffsetDateTime.class),
                resultSet.getLong("version"));
    }

    private List<String> readStringList(String json) {
        return objectMapper.readValue(json, new TypeReference<>() {
        });
    }
}
