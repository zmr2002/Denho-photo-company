package jp.co.tianho.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import jp.co.tianho.api.PostgresTestConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Import(PostgresTestConfiguration.class)
@SpringBootTest(properties = {
        "tianho.auth.bootstrap.enabled=true",
        "tianho.auth.bootstrap.email=mfa@example.com",
        "tianho.auth.bootstrap.password=administrator-test-password",
        "tianho.auth.bootstrap.display-name=MFA Administrator"
})
@AutoConfigureMockMvc
class AccountVerificationTests {

    @DynamicPropertySource
    static void configureMfaEncryption(DynamicPropertyRegistry registry) {
        registry.add("tianho.auth.mfa.encryption-key",
                () -> Base64.getEncoder().encodeToString(new byte[32]));
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TotpService totpService;

    @Test
    void bindsTotpAndConsumesRecoveryCodeOnce() throws Exception {
        UUID setupChallenge = passwordChallenge(true);

        MvcResult bindingResult = mockMvc.perform(post("/api/v1/auth/mfa/bind")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"challengeId\":\"%s\"}".formatted(setupChallenge)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.secret").isNotEmpty())
                .andExpect(jsonPath("$.provisioningUri").value(
                        org.hamcrest.Matchers.startsWith("otpauth://totp/")))
                .andExpect(jsonPath("$.provisioningUri").value(
                        org.hamcrest.Matchers.containsString("issuer=Denho")))
                .andReturn();
        String secret = json(bindingResult).get("secret").stringValue();
        String code = totpService.currentCode(secret, Instant.now());

        MvcResult verificationResult = mockMvc.perform(post("/api/v1/auth/mfa/verify")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"challengeId":"%s","code":"%s"}
                                """.formatted(setupChallenge, code)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session.authenticated").value(true))
                .andExpect(jsonPath("$.session.role").value("ADMIN"))
                .andExpect(jsonPath("$.recoveryCodes", hasSize(10)))
                .andReturn();
        String recoveryCode = json(verificationResult).get("recoveryCodes").get(0).stringValue();

        Boolean mfaEnabled = jdbcClient.sql("""
                        SELECT mfa_enabled FROM administrator_users WHERE email = 'mfa@example.com'
                        """).query(Boolean.class).single();
        Long recoveryCount = jdbcClient.sql("SELECT count(*) FROM administrator_recovery_codes")
                .query(Long.class).single();
        Long authenticatedSessions = jdbcClient.sql("""
                        SELECT count(*) FROM spring_session WHERE principal_name = 'mfa@example.com'
                        """).query(Long.class).single();
        assertThat(mfaEnabled).isTrue();
        assertThat(recoveryCount).isEqualTo(10);
        assertThat(authenticatedSessions).isEqualTo(1);

        UUID recoveryChallenge = passwordChallenge(false);
        mockMvc.perform(post("/api/v1/auth/mfa/bind")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"challengeId\":\"%s\"}".formatted(recoveryChallenge)))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/auth/mfa/recovery")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"challengeId":"%s","recoveryCode":"%s"}
                                """.formatted(recoveryChallenge, recoveryCode)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session.authenticated").value(true));

        UUID reusedCodeChallenge = passwordChallenge(false);
        mockMvc.perform(post("/api/v1/auth/mfa/recovery")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"challengeId":"%s","recoveryCode":"%s"}
                                """.formatted(reusedCodeChallenge, recoveryCode)))
                .andExpect(status().isUnauthorized());

        Long usedCodes = jdbcClient.sql("""
                        SELECT count(*) FROM administrator_recovery_codes WHERE used_at IS NOT NULL
                        """).query(Long.class).single();
        assertThat(usedCodes).isEqualTo(1);
    }

    private UUID passwordChallenge(boolean setupRequired) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"mfa@example.com","password":"administrator-test-password"}
                                """))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.setupRequired").value(setupRequired))
                .andReturn();
        return UUID.fromString(json(result).get("challengeId").stringValue());
    }

    private JsonNode json(MvcResult result) {
        return objectMapper.readTree(result.getResponse().getContentAsByteArray());
    }
}
