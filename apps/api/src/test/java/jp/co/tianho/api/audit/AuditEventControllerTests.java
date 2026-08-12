package jp.co.tianho.api.audit;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Import(PostgresTestConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuditEventControllerTests {

    private static final UUID ADMIN_ID = UUID.fromString("a8be850b-075e-4cd3-8376-9dc91be32c58");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void insertRecords() {
        jdbcClient.sql("""
                        INSERT INTO administrator_users (
                            id, email, display_name, password_hash, password_scheme, role, active, verified_at
                        ) VALUES (:id, 'owner@example.com', '负责人', 'unused', 'ARGON2ID', 'ADMIN', TRUE, CURRENT_TIMESTAMP)
                        """).param("id", ADMIN_ID).update();
        jdbcClient.sql("""
                        INSERT INTO audit_events (actor_id, event_type, resource_type, details)
                        VALUES (:actorId, 'USER_CREATED', 'ADMINISTRATOR_USER', '{}'::jsonb)
                        """).param("actorId", ADMIN_ID).update();
    }

    @Test
    void administratorsCanReadRecentEventsWithoutSensitiveDetails() throws Exception {
        mockMvc.perform(get("/api/v1/admin/audit-events").with(authentication(authenticationFor(AdministratorRole.ADMIN))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventType").value("USER_CREATED"))
                .andExpect(jsonPath("$[0].actorDisplayName").value("负责人"))
                .andExpect(jsonPath("$[0].details").doesNotExist())
                .andExpect(jsonPath("$[0].ipAddress").doesNotExist());
    }

    @Test
    void editorsCannotReadEvents() throws Exception {
        mockMvc.perform(get("/api/v1/admin/audit-events").with(authentication(authenticationFor(AdministratorRole.EDITOR))))
                .andExpect(status().isForbidden());
    }

    private Authentication authenticationFor(AdministratorRole role) {
        AdministratorPrincipal principal = new AdministratorPrincipal(ADMIN_ID, "owner@example.com", "负责人", role.name());
        return UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.authorities());
    }
}
