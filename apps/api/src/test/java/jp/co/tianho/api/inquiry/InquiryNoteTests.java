package jp.co.tianho.api.inquiry;

import static org.assertj.core.api.Assertions.assertThat;
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
class InquiryNoteTests {

    private static final UUID USER_ID = UUID.fromString("84b28908-8d15-402a-9830-74dc93d49852");
    private static final UUID INQUIRY_ID = UUID.fromString("ef362c5d-63de-4e44-ad52-c4a1077f1942");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void insertRecords() {
        jdbcClient.sql("""
                        INSERT INTO administrator_users (
                            id, email, display_name, password_hash, password_scheme, role, active, verified_at
                        ) VALUES (:id, 'editor@example.com', '内容编辑', 'unused', 'ARGON2ID', 'EDITOR', TRUE, CURRENT_TIMESTAMP)
                        """).param("id", USER_ID).update();
        jdbcClient.sql("""
                        INSERT INTO inquiries (
                            id, idempotency_key, name_company, email, project_type, message,
                            locale, consent_version, consented_at
                        ) VALUES (:id, gen_random_uuid(), '客户', 'client@example.com', '摄影', '咨询内容',
                                  'ja', 'v1', CURRENT_TIMESTAMP)
                        """).param("id", INQUIRY_ID).update();
    }

    @Test
    void storesAndReturnsInquiryNotesWithoutPuttingBodyInAuditDetails() throws Exception {
        mockMvc.perform(post("/api/v1/admin/inquiries/{id}/notes", INQUIRY_ID)
                        .with(authentication(editorAuthentication()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"body\":\" 已通过电话确认日期 \"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.body").value("已通过电话确认日期"))
                .andExpect(jsonPath("$.actorDisplayName").value("内容编辑"));

        mockMvc.perform(get("/api/v1/admin/inquiries/{id}/notes", INQUIRY_ID)
                        .with(authentication(editorAuthentication())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].body").value("已通过电话确认日期"));

        String details = jdbcClient.sql("""
                        SELECT details::text FROM audit_events WHERE event_type = 'INQUIRY_NOTE_ADDED'
                        """).query(String.class).single();
        assertThat(details).doesNotContain("已通过电话确认日期");
    }

    @Test
    void rejectsBlankAndOversizedNotes() throws Exception {
        mockMvc.perform(post("/api/v1/admin/inquiries/{id}/notes", INQUIRY_ID)
                        .with(authentication(editorAuthentication()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"body\":\"   \"}"))
                .andExpect(status().isBadRequest());
    }

    private Authentication editorAuthentication() {
        AdministratorPrincipal principal = new AdministratorPrincipal(
                USER_ID, "editor@example.com", "内容编辑", AdministratorRole.EDITOR.name());
        return UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.authorities());
    }
}
