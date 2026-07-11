package jp.co.tianho.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import jp.co.tianho.api.PostgresTestConfiguration;
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
import org.springframework.transaction.annotation.Transactional;

@Import(PostgresTestConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdministrationPermissionTests {

    private static final UUID ADMIN_ID = UUID.fromString("49b9eb02-431b-4352-87fa-bc89a5bb8a20");
    private static final UUID ARTICLE_ID = UUID.fromString("7c919965-2327-4f55-885f-23fd1188ce08");
    private static final UUID WORK_ID = UUID.fromString("df795a68-2563-4cb5-a199-b40337b4c04a");
    private static final UUID NOTICE_ID = UUID.fromString("b6646c14-c494-4726-aa6a-cf56ccb3769a");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void insertFixtures() {
        jdbcClient.sql("""
                        INSERT INTO administrator_users (
                            id, email, display_name, password_hash, password_scheme, role, active, verified_at
                        ) VALUES (
                            :id, 'permissions@example.com', 'Permissions administrator', 'unused',
                            'ARGON2ID', 'ADMIN', TRUE, CURRENT_TIMESTAMP
                        )
                        """)
                .param("id", ADMIN_ID)
                .update();
        jdbcClient.sql("""
                        INSERT INTO articles (
                            id, translation_group_id, locale, slug, title, excerpt, category, author_name, status
                        ) VALUES (
                            :id, :groupId, 'ja', 'permission-article', 'Permission article',
                            'Excerpt', 'Test', 'Editorial Team', 'DRAFT'
                        )
                        """)
                .param("id", ARTICLE_ID)
                .param("groupId", UUID.randomUUID())
                .update();
        jdbcClient.sql("""
                        INSERT INTO works (
                            id, translation_group_id, locale, slug, title, summary, client_name,
                            project_date, category, service_category, scope, challenge, outcome, status
                        ) VALUES (
                            :id, :groupId, 'ja', 'permission-work', 'Permission work', 'Summary', 'Client',
                            '2026', 'Test', 'event', 'Scope', 'Challenge', 'Outcome', 'DRAFT'
                        )
                        """)
                .param("id", WORK_ID)
                .param("groupId", UUID.randomUUID())
                .update();
        jdbcClient.sql("""
                        INSERT INTO opening_notices (
                            id, translation_group_id, locale, label, title, body,
                            dismiss_label, storage_key, dismissal_mode, status
                        ) VALUES (
                            :id, :groupId, 'ja', 'Notice', 'Permission notice', 'Body',
                            'Close', 'permission-notice', 'session', 'DRAFT'
                        )
                        """)
                .param("id", NOTICE_ID)
                .param("groupId", UUID.randomUUID())
                .update();
    }

    @Test
    void requiresAuthenticationAndCsrfForAdministrationWrites() throws Exception {
        mockMvc.perform(get("/api/v1/admin/articles"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/admin/articles")
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR))))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/v1/admin/works/{id}/images", WORK_ID)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"expectedVersion":0,"galleryEnabled":false,"mediaType":"photo","images":[]}
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void preventsEditorsFromPublishingOrManagingAccounts() throws Exception {
        Authentication editor = authenticationFor(AdministratorRole.EDITOR);
        for (String path : new String[] {
                "/api/v1/admin/articles/" + ARTICLE_ID + "/publish",
                "/api/v1/admin/works/" + WORK_ID + "/publish",
                "/api/v1/admin/notices/" + NOTICE_ID + "/publish"
        }) {
            mockMvc.perform(post(path)
                            .with(authentication(editor))
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"expectedVersion\":0}"))
                    .andExpect(status().isForbidden());
        }

        mockMvc.perform(get("/api/v1/admin/users").with(authentication(editor)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/admin/audit-events").with(authentication(editor)))
                .andExpect(status().isForbidden());
    }

    @Test
    void allowsAdministratorsToPublishEveryContentTypeAndAuditsEachAction() throws Exception {
        Authentication administrator = authenticationFor(AdministratorRole.ADMIN);
        for (String path : new String[] {
                "/api/v1/admin/articles/" + ARTICLE_ID + "/publish",
                "/api/v1/admin/works/" + WORK_ID + "/publish",
                "/api/v1/admin/notices/" + NOTICE_ID + "/publish"
        }) {
            mockMvc.perform(post(path)
                            .with(authentication(administrator))
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"expectedVersion\":0}"))
                    .andExpect(status().isOk());
        }

        Long events = jdbcClient.sql("""
                        SELECT count(*) FROM audit_events WHERE event_type = 'CONTENT_PUBLISHED'
                        """)
                .query(Long.class)
                .single();
        assertThat(events).isEqualTo(3);
    }

    @Test
    void rejectsInvalidContentBeforeDatabaseChanges() throws Exception {
        mockMvc.perform(post("/api/v1/admin/articles")
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"locale":"invalid","slug":"Invalid Slug","title":"","excerpt":"",
                                "category":"","authorName":"","heroTone":"invalid","relatedServices":[],
                                "blocks":[]}
                                """))
                .andExpect(status().isBadRequest());

        Long records = jdbcClient.sql("SELECT count(*) FROM articles WHERE slug = 'Invalid Slug'")
                .query(Long.class)
                .single();
        assertThat(records).isZero();
    }

    private Authentication authenticationFor(AdministratorRole role) {
        AdministratorPrincipal principal = new AdministratorPrincipal(
                ADMIN_ID, "permissions@example.com", "Permissions administrator", role.name());
        return UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.authorities());
    }
}
