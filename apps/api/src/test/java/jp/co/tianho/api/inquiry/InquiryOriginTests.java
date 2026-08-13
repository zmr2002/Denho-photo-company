package jp.co.tianho.api.inquiry;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import jp.co.tianho.api.PostgresTestConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Import(PostgresTestConfiguration.class)
@SpringBootTest(properties = {
        "tianho.security.origin-validation-enabled=true",
        "tianho.security.allowed-origins=https://www.example.test"
})
@AutoConfigureMockMvc
@Transactional
class InquiryOriginTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void rejectsUntrustedWriteOrigin() throws Exception {
        mockMvc.perform(post("/api/v1/public/inquiries")
                        .with(csrf())
                        .header("Origin", "https://untrusted.example")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest()))
                .andExpect(status().isForbidden());
    }

    @Test
    void acceptsConfiguredWriteOrigin() throws Exception {
        mockMvc.perform(post("/api/v1/public/inquiries")
                        .with(csrf())
                        .header("Origin", "https://www.example.test")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest()))
                .andExpect(status().isCreated());
    }

    private String validRequest() {
        return """
                {
                  "idempotencyKey":"%s",
                  "nameCompany":"Origin Customer",
                  "email":"origin@example.com",
                  "projectType":"Photography",
                  "message":"Please provide details for this photography project.",
                  "locale":"en",
                  "consentVersion":"2026-07",
                  "consented":true,
                  "companyWebsite":""
                }
                """.formatted(UUID.randomUUID());
    }
}
