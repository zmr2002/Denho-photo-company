package jp.co.tianho.api.content.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import jp.co.tianho.api.PostgresTestConfiguration;
import jp.co.tianho.api.auth.AdministratorPrincipal;
import jp.co.tianho.api.auth.AdministratorRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Import(PostgresTestConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminContentTests {

    private static final UUID ADMIN_ID = UUID.fromString("bb2b064a-e936-47c6-a456-86bedec78937");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void insertAdministrator() {
        jdbcClient.sql("""
                        INSERT INTO administrator_users (
                            id, email, display_name, password_hash, password_scheme, role, active, verified_at
                        ) VALUES (
                            :id, 'content@example.com', 'Content administrator', 'unused',
                            'ARGON2ID', 'ADMIN', TRUE, CURRENT_TIMESTAMP
                        )
                        """)
                .param("id", ADMIN_ID)
                .update();
    }

    @Test
    void createsUpdatesAndListsArticleWithRevisions() throws Exception {
        MvcResult created = createArticle(AdministratorRole.EDITOR)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.blocks[0].body").value("Initial body"))
                .andReturn();
        JsonNode article = objectMapper.readTree(created.getResponse().getContentAsString());
        String id = article.get("id").stringValue();

        mockMvc.perform(patch("/api/v1/admin/articles/{id}", id)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"expectedVersion":0,"article":%s}
                                """.formatted(articleBody("Updated title", "Updated body"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.title").value("Updated title"));

        mockMvc.perform(get("/api/v1/admin/articles/{id}/revisions", id)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("UPDATED"))
                .andExpect(jsonPath("$[0].snapshot.blocks[0].body").value("Updated body"))
                .andExpect(jsonPath("$[1].action").value("CREATED"));

        mockMvc.perform(patch("/api/v1/admin/articles/{id}", id)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"expectedVersion":0,"article":%s}
                                """.formatted(articleBody("Stale title", "Stale body"))))
                .andExpect(status().isConflict());
    }

    @Test
    void editorsCannotModifyPublishedContent() throws Exception {
        MvcResult created = createArticle(AdministratorRole.EDITOR).andReturn();
        JsonNode article = objectMapper.readTree(created.getResponse().getContentAsString());
        String id = article.get("id").stringValue();

        mockMvc.perform(post("/api/v1/admin/articles/{id}/publish", id)
                        .with(authentication(authenticationFor(AdministratorRole.ADMIN)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedVersion\":0}"))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/v1/admin/articles/{id}", id)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"expectedVersion":1,"article":%s}
                                """.formatted(articleBody("Blocked title", "Blocked body"))))
                .andExpect(status().isConflict());
    }

    @Test
    void savesNoticesAndUpdatesWorkImages() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/notices")
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "locale":"zh","enabled":true,"label":"通知","title":"临时通知",
                                  "body":"通知内容","dismissLabel":"关闭","storageKey":"notice-zh",
                                  "dismissalMode":"session","expectedVersion":0
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"));

        UUID workId = UUID.randomUUID();
        jdbcClient.sql("""
                        INSERT INTO works (
                            id, translation_group_id, locale, slug, title, summary, client_name,
                            project_date, category, service_category, scope, challenge, outcome, status
                        ) VALUES (
                            :id, :translationGroupId, 'ja', 'image-test', 'Image test', 'Summary', 'Client',
                            '2026', 'Test', 'event', 'Scope', 'Challenge', 'Outcome', 'DRAFT'
                        )
                        """)
                .param("id", workId)
                .param("translationGroupId", UUID.randomUUID())
                .update();

        mockMvc.perform(patch("/api/v1/admin/works/{id}/images", workId)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "expectedVersion":0,"galleryEnabled":true,"mediaType":"gallery",
                                  "images":[{"path":"/image.jpg","label":"Cover","tone":"neutral",
                                    "isCover":true,"sortOrder":0}]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.images[0].is_cover").value(true));

        Boolean cover = jdbcClient.sql("SELECT is_cover FROM work_images WHERE work_id = :workId")
                .param("workId", workId)
                .query(Boolean.class)
                .single();
        assertThat(cover).isTrue();
    }

    private org.springframework.test.web.servlet.ResultActions createArticle(AdministratorRole role) throws Exception {
        return mockMvc.perform(post("/api/v1/admin/articles")
                .with(authentication(authenticationFor(role)))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(articleBody("Initial title", "Initial body")));
    }

    private String articleBody(String title, String body) {
        return """
                {
                  "locale":"ja","slug":"content-test","title":"%s","excerpt":"Excerpt",
                  "category":"Test","authorName":"Editorial Team","heroTone":"neutral",
                  "displayOrder":0,"relatedServices":[],"demo":false,
                  "blocks":[{"type":"paragraph","body":"%s","imageTone":"neutral","sortOrder":0}]
                }
                """.formatted(title, body);
    }

    private Authentication authenticationFor(AdministratorRole role) {
        AdministratorPrincipal principal = new AdministratorPrincipal(
                ADMIN_ID, "content@example.com", "Content administrator", role.name());
        return UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.authorities());
    }
}
