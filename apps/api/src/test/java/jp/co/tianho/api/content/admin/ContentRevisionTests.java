package jp.co.tianho.api.content.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import org.springframework.dao.DataAccessException;
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
class ContentRevisionTests {

    private static final UUID ADMIN_ID = UUID.fromString("0955102c-75fd-4f66-a5d8-6dcf01629151");
    private static final UUID ARTICLE_ID = UUID.fromString("2cb9fc22-310c-449d-b87f-22479e9fb3ad");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void insertContentAndAdministrator() {
        jdbcClient.sql("""
                        INSERT INTO administrator_users (
                            id, email, display_name, password_hash, password_scheme, role, active, verified_at
                        ) VALUES (
                            :id, 'publisher@example.com', 'Publisher', 'unused', 'ARGON2ID',
                            'ADMIN', TRUE, CURRENT_TIMESTAMP
                        )
                        """)
                .param("id", ADMIN_ID)
                .update();
        jdbcClient.sql("""
                        INSERT INTO articles (
                            id, translation_group_id, locale, slug, title, excerpt, category, author_name, status
                        ) VALUES (
                            :id, :translationGroupId, 'ja', 'revision-test', 'Revision test',
                            'Revision test excerpt', 'Test', 'Editorial Team', 'DRAFT'
                        )
                        """)
                .param("id", ARTICLE_ID)
                .param("translationGroupId", UUID.randomUUID())
                .update();
    }

    @Test
    void publishesWithOptimisticLockAndStoresImmutableRevision() throws Exception {
        mockMvc.perform(post("/api/v1/admin/articles/{id}/publish", ARTICLE_ID)
                        .with(authentication(authenticationFor(AdministratorRole.ADMIN)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedVersion\":0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"))
                .andExpect(jsonPath("$.version").value(1));

        mockMvc.perform(get("/api/v1/admin/articles/{id}/revisions", ARTICLE_ID)
                        .with(authentication(authenticationFor(AdministratorRole.ADMIN))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("PUBLISHED"))
                .andExpect(jsonPath("$[0].snapshot.status").value("PUBLISHED"));

        Long auditCount = jdbcClient.sql("""
                        SELECT count(*) FROM audit_events
                        WHERE event_type = 'CONTENT_PUBLISHED' AND resource_id = :resourceId
                        """)
                .param("resourceId", ARTICLE_ID)
                .query(Long.class)
                .single();
        assertThat(auditCount).isEqualTo(1);

        assertThatThrownBy(() -> jdbcClient.sql("""
                        UPDATE content_revisions SET action = 'CHANGED' WHERE resource_id = :resourceId
                        """)
                .param("resourceId", ARTICLE_ID)
                .update()).isInstanceOf(DataAccessException.class);
    }

    @Test
    void rejectsStaleVersions() throws Exception {
        publishAsAdministrator(0).andExpect(status().isOk());
        publishAsAdministrator(0)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.type").value("/problems/content-revision-conflict"));
    }

    @Test
    void preventsEditorsFromPublishing() throws Exception {
        mockMvc.perform(post("/api/v1/admin/articles/{id}/publish", ARTICLE_ID)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedVersion\":0}"))
                .andExpect(status().isForbidden());
    }

    private org.springframework.test.web.servlet.ResultActions publishAsAdministrator(long version) throws Exception {
        return mockMvc.perform(post("/api/v1/admin/articles/{id}/publish", ARTICLE_ID)
                .with(authentication(authenticationFor(AdministratorRole.ADMIN)))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"expectedVersion\":%d}".formatted(version)));
    }

    private Authentication authenticationFor(AdministratorRole role) {
        AdministratorPrincipal principal = new AdministratorPrincipal(
                ADMIN_ID, "publisher@example.com", "Publisher", role.name());
        return UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.authorities());
    }
}
