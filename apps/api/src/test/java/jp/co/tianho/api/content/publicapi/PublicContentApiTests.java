package jp.co.tianho.api.content.publicapi;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import jp.co.tianho.api.PostgresTestConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Import(PostgresTestConfiguration.class)
@SpringBootTest(properties = "tianho.content.bootstrap.enabled=true")
@AutoConfigureMockMvc
class PublicContentApiTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @Test
    void migrationChecksumMatchesContent() throws Exception {
        byte[] content = new ClassPathResource("content-migration/current-content.json")
                .getInputStream().readAllBytes();
        byte[] canonicalContent = new String(content, StandardCharsets.UTF_8)
                .replace("\r\n", "\n")
                .getBytes(StandardCharsets.UTF_8);
        String expected = new String(
                new ClassPathResource("content-migration/current-content.sha256")
                        .getInputStream().readAllBytes(),
                StandardCharsets.UTF_8).trim();
        String actual = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(canonicalContent));

        org.assertj.core.api.Assertions.assertThat(actual).isEqualTo(expected);
    }

    @Test
    void importsOnlyThePublishedTutorialArticle() throws Exception {
        mockMvc.perform(get("/api/v1/public/articles").queryParam("locale", "zh"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].slug").value("admin-tutorial-sample"))
                .andExpect(jsonPath("$[0].demo").value(true))
                .andExpect(content().string(org.hamcrest.Matchers.not(containsString("testcontext"))));

        mockMvc.perform(get("/api/v1/public/articles/admin-tutorial-sample").queryParam("locale", "zh"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("后台教学示例：如何编辑一篇制作案例文章"))
                .andExpect(jsonPath("$.blocks", hasSize(9)));

        mockMvc.perform(get("/api/v1/public/articles").queryParam("locale", "ja"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @Transactional
    void hidesDraftArticles() throws Exception {
        jdbcClient.sql("""
                        INSERT INTO articles (
                            id, translation_group_id, locale, slug, title, excerpt, category, author_name, status
                        ) VALUES (
                            '8ee7e3a8-f8d9-4d9e-a779-0c86fb5f66d8',
                            'f84131a6-c176-4d14-b1d8-f55c64180c32',
                            'zh', 'private-draft', 'Draft', 'Draft excerpt', 'Draft', 'Editor', 'DRAFT'
                        )
                        """).update();

        mockMvc.perform(get("/api/v1/public/articles/private-draft").queryParam("locale", "zh"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Content not found"));
    }

    @Test
    @Transactional
    void returnsPublishedWorksWithLocalizedImages() throws Exception {
        jdbcClient.sql("""
                        INSERT INTO works (
                            id, translation_group_id, locale, slug, title, summary, client_name, project_date,
                            category, service_category, scope, challenge, approach, outcome, deliverables,
                            status, featured_on_homepage, featured_order, media_type, gallery_enabled
                        ) VALUES (
                            '07bd7d3e-9d9c-4f5f-a19a-d9d2f33e68f1',
                            'f2cabf8d-2bf1-4cde-b639-5b9f771b24ca',
                            'zh', 'published-work', '公开作品', '作品摘要', '客户', '2026',
                            '活动', 'event', '摄影', '现场光线', '["勘景","拍摄"]', '完成交付',
                            '["照片"]', 'PUBLISHED', TRUE, 1, 'photo', TRUE
                        )
                        """).update();
        jdbcClient.sql("""
                        INSERT INTO work_images (
                            id, work_id, path, label, tone, alt_ja, alt_zh, alt_en,
                            caption_ja, caption_zh, caption_en, is_cover, sort_order
                        ) VALUES (
                            'f55d1b74-f4f8-4788-ae59-07c26615706c',
                            '07bd7d3e-9d9c-4f5f-a19a-d9d2f33e68f1',
                            '/media/work.jpg', '封面', 'warm', '日本語', '中文替代文字', 'English',
                            '日本語', '中文说明', 'English', TRUE, 1
                        )
                        """).update();

        mockMvc.perform(get("/api/v1/public/works").queryParam("locale", "zh"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].slug").value("published-work"))
                .andExpect(jsonPath("$[0].scope").value("摄影"))
                .andExpect(jsonPath("$[0].coverImageAlt").value("中文替代文字"))
                .andExpect(jsonPath("$[0].images", hasSize(1)))
                .andExpect(jsonPath("$[0].images[0].caption").value("中文说明"));

        mockMvc.perform(get("/api/v1/public/works/published-work").queryParam("locale", "zh"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approach", hasSize(2)))
                .andExpect(jsonPath("$.images[0].caption").value("中文说明"));
    }

    @Test
    @Transactional
    void returnsOnlyTheCurrentOpeningNotice() throws Exception {
        jdbcClient.sql("""
                        INSERT INTO opening_notices (
                            id, translation_group_id, locale, enabled, label, title, body,
                            dismiss_label, storage_key, dismissal_mode, status, start_at, end_at
                        ) VALUES (
                            'c8d78bd0-6120-4213-9ab7-b88753c1caeb',
                            '772875cd-ef99-4ed6-96eb-a1a8ec912d27',
                            'zh', TRUE, '通知', '当前通知', '通知内容', '关闭', 'notice-zh', 'session',
                            'PUBLISHED', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP + INTERVAL '1 hour'
                        )
                        """).update();

        mockMvc.perform(get("/api/v1/public/notices/current").queryParam("locale", "zh"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("当前通知"));

        mockMvc.perform(get("/api/v1/public/notices/current").queryParam("locale", "en"))
                .andExpect(status().isNoContent());
    }

    @Test
    void rejectsUnsupportedLocalesWithProblemDetails() throws Exception {
        mockMvc.perform(get("/api/v1/public/articles").queryParam("locale", "fr"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid request"))
                .andExpect(jsonPath("$.violations", hasSize(1)));
    }

    @Test
    void publishesAllContentPathsInOpenApi() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/v1/public/articles']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/public/articles/{slug}']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/public/works']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/public/works/{slug}']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/public/notices/current']").exists());
    }
}
