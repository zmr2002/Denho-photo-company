package jp.co.tianho.api.auth;

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
class AdministratorRoleTests {

    private static final UUID ADMIN_ID = UUID.fromString("c0663319-2081-4d37-a548-d9b9831a6e6f");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void insertAdministrator() {
        jdbcClient.sql("""
                        INSERT INTO administrator_users (
                            id, email, display_name, password_hash, password_scheme, role, active, verified_at
                        ) VALUES (
                            :id, 'owner@example.com', 'Owner', 'unused', 'ARGON2ID', 'ADMIN', TRUE, CURRENT_TIMESTAMP
                        )
                        """)
                .param("id", ADMIN_ID)
                .update();
    }

    @Test
    void editorsCannotManageUsersOrPublishContent() throws Exception {
        Authentication editor = authenticationFor(
                UUID.randomUUID(), "editor@example.com", AdministratorRole.EDITOR);

        mockMvc.perform(get("/api/v1/admin/users").with(authentication(editor)))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/v1/admin/articles/123/publish")
                        .with(authentication(editor))
                        .with(csrf()))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/admin/media").with(authentication(editor)))
                .andExpect(status().isOk());
    }

    @Test
    void administratorsCreateEditorsAndRecordAuditEvent() throws Exception {
        mockMvc.perform(post("/api/v1/admin/users")
                        .with(authentication(adminAuthentication()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email":"editor@example.com",
                                  "displayName":"Content Editor",
                                  "password":"editor-password-12345",
                                  "role":"EDITOR"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("editor@example.com"))
                .andExpect(jsonPath("$.role").value("EDITOR"))
                .andExpect(jsonPath("$.active").value(true));

        String scheme = jdbcClient.sql("""
                        SELECT password_scheme FROM administrator_users WHERE email = 'editor@example.com'
                        """).query(String.class).single();
        Long auditEvents = jdbcClient.sql("""
                        SELECT count(*) FROM audit_events WHERE event_type = 'USER_CREATED'
                        """).query(Long.class).single();
        assertThat(scheme).isEqualTo("ARGON2ID");
        assertThat(auditEvents).isEqualTo(1);
    }

    @Test
    void administratorsCannotDemoteOrDeactivateThemselves() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/users/{id}/role", ADMIN_ID)
                        .with(authentication(adminAuthentication()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"EDITOR\"}"))
                .andExpect(status().isConflict());

        mockMvc.perform(patch("/api/v1/admin/users/{id}/status", ADMIN_ID)
                        .with(authentication(adminAuthentication()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
                .andExpect(status().isConflict());
    }

    private Authentication adminAuthentication() {
        return authenticationFor(ADMIN_ID, "owner@example.com", AdministratorRole.ADMIN);
    }

    private Authentication authenticationFor(UUID id, String email, AdministratorRole role) {
        AdministratorPrincipal principal = new AdministratorPrincipal(id, email, email, role.name());
        return UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.authorities());
    }
}
