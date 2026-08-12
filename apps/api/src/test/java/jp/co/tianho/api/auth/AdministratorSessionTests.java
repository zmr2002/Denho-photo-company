package jp.co.tianho.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import jp.co.tianho.api.PostgresTestConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.transaction.annotation.Transactional;

@Import(PostgresTestConfiguration.class)
@SpringBootTest(properties = {
        "tianho.auth.bootstrap.enabled=true",
        "tianho.auth.bootstrap.email=admin@example.com",
        "tianho.auth.bootstrap.password=administrator-test-password",
        "tianho.auth.bootstrap.display-name=Test Administrator"
})
@AutoConfigureMockMvc
class AdministratorSessionTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private BCryptPasswordEncoder bcryptPasswordEncoder;

    @Autowired
    private Environment environment;

    @Test
    void exposesCsrfTokenWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void rejectsLoginWithoutCsrfToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("admin@example.com", "administrator-test-password")))
                .andExpect(status().isForbidden());
    }

    @Test
    void passwordLoginCreatesServerSession() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("admin@example.com", "administrator-test-password")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.email").value("admin@example.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andReturn();

        assertThat(environment.getProperty("server.servlet.session.cookie.name"))
                .isEqualTo("__Host-tianho-session");
        assertThat(environment.getProperty("server.servlet.session.cookie.secure")).isEqualTo("true");
        assertThat(environment.getProperty("server.servlet.session.cookie.http-only")).isEqualTo("true");
        assertThat(environment.getProperty("server.servlet.session.cookie.same-site")).isEqualTo("lax");
        assertThat(environment.getProperty("server.servlet.session.cookie.path")).isEqualTo("/");

        Long persistedSessions = jdbcClient.sql("""
                        SELECT count(*) FROM spring_session WHERE principal_name = 'admin@example.com'
                        """)
                .query(Long.class).single();
        assertThat(persistedSessions).isGreaterThanOrEqualTo(1);

        String setCookie = login.getResponse().getHeader(org.springframework.http.HttpHeaders.SET_COOKIE);
        assertThat(setCookie)
                .contains("__Host-tianho-session=")
                .contains("Secure")
                .contains("HttpOnly")
                .contains("SameSite=Lax");
    }

    @Test
    void rejectsPasswordsShorterThanEightCharacters() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("admin@example.com", "short")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Transactional
    void locksAccountAfterFiveFailedLogins() throws Exception {
        for (int attempt = 0; attempt < 5; attempt++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(loginJson("admin@example.com", "incorrect-password")))
                    .andExpect(status().isUnauthorized());
        }

        Integer failures = jdbcClient.sql("""
                        SELECT failed_login_count FROM administrator_users WHERE email = 'admin@example.com'
                        """).query(Integer.class).single();
        Boolean locked = jdbcClient.sql("""
                        SELECT locked_until > CURRENT_TIMESTAMP
                        FROM administrator_users WHERE email = 'admin@example.com'
                        """).query(Boolean.class).single();
        Long attempts = jdbcClient.sql("""
                        SELECT count(*) FROM administrator_login_attempts WHERE email = 'admin@example.com'
                        """).query(Long.class).single();

        assertThat(failures).isEqualTo(5);
        assertThat(locked).isTrue();
        assertThat(attempts).isGreaterThanOrEqualTo(5);

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("admin@example.com", "administrator-test-password")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Transactional
    void upgradesBcryptPasswordAfterSuccessfulLogin() throws Exception {
        String bcryptHash = bcryptPasswordEncoder.encode("legacy-password-123");
        UUID id = UUID.randomUUID();
        jdbcClient.sql("""
                        INSERT INTO administrator_users (
                            id, email, display_name, password_hash, password_scheme, role, active, verified_at
                        ) VALUES (
                            :id, 'legacy@example.com', 'Legacy User', :passwordHash,
                            'BCRYPT', 'ADMIN', TRUE, CURRENT_TIMESTAMP
                        )
                        """)
                .param("id", id)
                .param("passwordHash", bcryptHash)
                .update();

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("legacy@example.com", "legacy-password-123")))
                .andExpect(status().isOk());

        String scheme = jdbcClient.sql("SELECT password_scheme FROM administrator_users WHERE id = :id")
                .param("id", id)
                .query(String.class)
                .single();
        String passwordHash = jdbcClient.sql("SELECT password_hash FROM administrator_users WHERE id = :id")
                .param("id", id)
                .query(String.class)
                .single();
        assertThat(scheme).isEqualTo("ARGON2ID");
        assertThat(passwordHash).startsWith("$argon2");
    }

    @Test
    @Transactional
    void limitsLoginAttemptsFromOneAddress() throws Exception {
        String address = "203.0.113.42";
        for (int attempt = 0; attempt < 20; attempt++) {
            jdbcClient.sql("""
                            INSERT INTO administrator_login_attempts (
                                email, ip_address, successful, failure_reason
                            ) VALUES ('unknown@example.com', :address, FALSE, 'INVALID_CREDENTIALS')
                            """)
                    .param("address", address)
                    .update();
        }

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .with(request -> {
                            ((MockHttpServletRequest) request).setRemoteAddr(address);
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("admin@example.com", "administrator-test-password")))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.type").value("/problems/login-rate-limit"))
                .andExpect(result -> assertThat(result.getResponse().getHeader("Retry-After")).isEqualTo("900"));
    }

    private String loginJson(String email, String password) {
        return """
                {"email":"%s","password":"%s"}
                """.formatted(email, password);
    }
}
