package jp.co.tianho.api.inquiry;

import java.time.Duration;
import java.time.OffsetDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InquiryRetentionService {

    private final JdbcClient jdbcClient;
    private final Duration retentionPeriod;

    public InquiryRetentionService(
            JdbcClient jdbcClient,
            @Value("${tianho.inquiry.retention-period:180d}") Duration retentionPeriod) {
        this.jdbcClient = jdbcClient;
        this.retentionPeriod = retentionPeriod;
    }

    @Scheduled(cron = "${tianho.inquiry.retention-cron:0 35 3 * * *}")
    @Transactional
    public int anonymizeExpired() {
        OffsetDateTime cutoff = OffsetDateTime.now().minus(retentionPeriod);
        jdbcClient.sql("""
                        UPDATE inquiry_outbox outbox
                        SET status = 'FAILED', attempts = 5, last_error = 'RetentionExpired',
                            updated_at = CURRENT_TIMESTAMP
                        FROM inquiries inquiry
                        WHERE outbox.inquiry_id = inquiry.id
                          AND inquiry.created_at < :cutoff
                          AND inquiry.anonymized_at IS NULL
                          AND outbox.status <> 'SENT'
                        """)
                .param("cutoff", cutoff)
                .update();

        jdbcClient.sql("""
                        DELETE FROM inquiry_notes note
                        USING inquiries inquiry
                        WHERE note.inquiry_id = inquiry.id
                          AND inquiry.created_at < :cutoff
                          AND inquiry.anonymized_at IS NULL
                        """)
                .param("cutoff", cutoff)
                .update();

        return jdbcClient.sql("""
                        UPDATE inquiries
                        SET name_company = '[removed]',
                            email = 'removed@invalid.example',
                            requested_date = NULL,
                            location = NULL,
                            message = '[removed]',
                            ip_hash = NULL,
                            status = 'ANONYMIZED',
                            anonymized_at = CURRENT_TIMESTAMP,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE created_at < :cutoff AND anonymized_at IS NULL
                        """)
                .param("cutoff", cutoff)
                .update();
    }
}
