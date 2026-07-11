package jp.co.tianho.api.inquiry;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Import(PostgresTestConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class InquiryProtectionTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private InquiryOutboxRepository outboxRepository;

    @Autowired
    private InquiryRetentionService retentionService;

    @BeforeEach
    void clearInquiryData() {
        jdbcClient.sql("DELETE FROM inquiry_outbox").update();
        jdbcClient.sql("DELETE FROM inquiries").update();
        jdbcClient.sql("DELETE FROM inquiry_request_buckets").update();
    }

    @Test
    void createsInquiryAndOutboxOnlyOnceForIdempotentRetries() throws Exception {
        UUID idempotencyKey = UUID.randomUUID();

        String firstId = mockMvc.perform(post("/api/v1/public/inquiries")
                        .with(csrf())
                        .with(request -> { request.setRemoteAddr("192.0.2.10"); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(idempotencyKey, "")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("NEW"))
                .andReturn().getResponse().getContentAsString();

        mockMvc.perform(post("/api/v1/public/inquiries")
                        .with(csrf())
                        .with(request -> { request.setRemoteAddr("192.0.2.10"); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(idempotencyKey, "")))
                .andExpect(status().isCreated())
                .andExpect(content -> assertThat(content.getResponse().getContentAsString()).isEqualTo(firstId));

        assertThat(count("inquiries")).isEqualTo(1);
        assertThat(count("inquiry_outbox")).isEqualTo(1);
    }

    @Test
    void rejectsInvalidInquiryWithoutSavingIt() throws Exception {
        String invalid = validRequest(UUID.randomUUID(), "").replace("customer@example.com", "invalid-address");

        mockMvc.perform(post("/api/v1/public/inquiries")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalid))
                .andExpect(status().isBadRequest());

        assertThat(count("inquiries")).isZero();
    }

    @Test
    void acceptsHoneypotSubmissionWithoutSavingIt() throws Exception {
        mockMvc.perform(post("/api/v1/public/inquiries")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(UUID.randomUUID(), "https://unwanted.example")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("NEW"));

        assertThat(count("inquiries")).isZero();
        assertThat(count("inquiry_request_buckets")).isZero();
    }

    @Test
    void limitsRepeatedRequestsAndStoresOnlyAddressHash() throws Exception {
        for (int attempt = 0; attempt < 5; attempt++) {
            mockMvc.perform(post("/api/v1/public/inquiries")
                            .with(csrf())
                            .with(request -> { request.setRemoteAddr("198.51.100.20"); return request; })
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(validRequest(UUID.randomUUID(), "")))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(post("/api/v1/public/inquiries")
                        .with(csrf())
                        .with(request -> { request.setRemoteAddr("198.51.100.20"); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(UUID.randomUUID(), "")))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", "900"));

        String storedHash = jdbcClient.sql("SELECT ip_hash FROM inquiries LIMIT 1").query(String.class).single();
        assertThat(storedHash).hasSize(64).doesNotContain("198.51.100.20");
        assertThat(jdbcClient.sql("SELECT request_count FROM inquiry_request_buckets")
                .query(Integer.class).single()).isEqualTo(6);
    }

    @Test
    void retriesAndCompletesQueuedNotification() throws Exception {
        mockMvc.perform(post("/api/v1/public/inquiries")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(UUID.randomUUID(), "")))
                .andExpect(status().isCreated());

        InquiryOutboxRepository.PendingNotification first = outboxRepository.claimNext().orElseThrow();
        outboxRepository.markFailed(first.outboxId(), first.attempts(), "TemporaryFailure");
        jdbcClient.sql("UPDATE inquiry_outbox SET available_at = CURRENT_TIMESTAMP").update();
        InquiryOutboxRepository.PendingNotification retry = outboxRepository.claimNext().orElseThrow();
        outboxRepository.markSent(retry.outboxId());

        assertThat(retry.attempts()).isEqualTo(2);
        assertThat(jdbcClient.sql("SELECT status::text FROM inquiry_outbox")
                .query(String.class).single()).isEqualTo("SENT");
    }

    @Test
    void anonymizesExpiredInquiryAndStopsPendingNotification() throws Exception {
        mockMvc.perform(post("/api/v1/public/inquiries")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(UUID.randomUUID(), "")))
                .andExpect(status().isCreated());
        jdbcClient.sql("UPDATE inquiries SET created_at = CURRENT_TIMESTAMP - INTERVAL '181 days'").update();

        assertThat(retentionService.anonymizeExpired()).isEqualTo(1);

        MapRow inquiry = jdbcClient.sql("""
                        SELECT name_company, email, message, location, ip_hash, status::text AS status
                        FROM inquiries
                        """)
                .query((row, number) -> new MapRow(
                        row.getString("name_company"), row.getString("email"), row.getString("message"),
                        row.getString("location"), row.getString("ip_hash"), row.getString("status")))
                .single();
        assertThat(inquiry).isEqualTo(new MapRow(
                "[removed]", "removed@invalid.example", "[removed]", null, null, "ANONYMIZED"));
        assertThat(jdbcClient.sql("SELECT status::text FROM inquiry_outbox")
                .query(String.class).single()).isEqualTo("FAILED");
    }

    @Test
    void addsBrowserSecurityHeaders() throws Exception {
        mockMvc.perform(get("/api/v1/public/articles"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().exists("Content-Security-Policy-Report-Only"));

        mockMvc.perform(get("/api/v1/admin/inquiries"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("Cache-Control", containsString("no-store")));
    }

    private int count(String table) {
        return jdbcClient.sql("SELECT count(*) FROM " + table).query(Integer.class).single();
    }

    private String validRequest(UUID idempotencyKey, String website) {
        return """
                {
                  "idempotencyKey":"%s",
                  "nameCompany":"Example Customer",
                  "email":"customer@example.com",
                  "projectType":"Photography",
                  "requestedDate":"2026-09",
                  "location":"Tokyo",
                  "message":"Please provide details for this photography project.",
                  "locale":"en",
                  "consentVersion":"2026-07",
                  "consented":true,
                  "turnstileToken":"",
                  "companyWebsite":"%s"
                }
                """.formatted(idempotencyKey, website);
    }

    private record MapRow(
            String nameCompany, String email, String message, String location, String ipHash, String status) {
    }
}
