package jp.co.tianho.api.inquiry;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class InquiryOutboxRepository {

    private final JdbcClient jdbcClient;

    public InquiryOutboxRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    @Transactional
    public Optional<PendingNotification> claimNext() {
        return jdbcClient.sql("""
                        WITH reset_stale AS (
                            UPDATE inquiry_outbox SET status = 'FAILED', last_error = 'DeliveryInterrupted',
                                available_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                            WHERE status = 'SENDING' AND updated_at < CURRENT_TIMESTAMP - INTERVAL '10 minutes'
                        ), candidate AS (
                            SELECT id FROM inquiry_outbox
                            WHERE status IN ('PENDING', 'FAILED')
                              AND available_at <= CURRENT_TIMESTAMP
                              AND attempts < 5
                            ORDER BY created_at, id
                            FOR UPDATE SKIP LOCKED
                            LIMIT 1
                        ), claimed AS (
                            UPDATE inquiry_outbox outbox
                            SET status = 'SENDING', attempts = attempts + 1,
                                last_error = NULL, updated_at = CURRENT_TIMESTAMP
                            FROM candidate
                            WHERE outbox.id = candidate.id
                            RETURNING outbox.id, outbox.inquiry_id, outbox.attempts
                        )
                        SELECT claimed.id AS outbox_id, claimed.inquiry_id, claimed.attempts,
                               inquiry.name_company, inquiry.email, inquiry.project_type,
                               inquiry.requested_date, inquiry.location, inquiry.message, inquiry.locale
                        FROM claimed JOIN inquiries inquiry ON inquiry.id = claimed.inquiry_id
                        """)
                .query(this::mapNotification)
                .optional();
    }

    public void markSent(UUID outboxId) {
        jdbcClient.sql("""
                        UPDATE inquiry_outbox SET status = 'SENT', sent_at = CURRENT_TIMESTAMP,
                            updated_at = CURRENT_TIMESTAMP WHERE id = :id AND status = 'SENDING'
                        """)
                .param("id", outboxId)
                .update();
    }

    public void markFailed(UUID outboxId, int attempts, String errorType) {
        jdbcClient.sql("""
                        UPDATE inquiry_outbox SET status = 'FAILED', last_error = :errorType,
                            available_at = CURRENT_TIMESTAMP + (:delayMinutes * INTERVAL '1 minute'),
                            updated_at = CURRENT_TIMESTAMP WHERE id = :id AND status = 'SENDING'
                        """)
                .param("id", outboxId)
                .param("errorType", errorType)
                .param("delayMinutes", Math.min(60, 1 << Math.min(attempts, 5)))
                .update();
    }

    private PendingNotification mapNotification(ResultSet resultSet, int rowNumber) throws SQLException {
        return new PendingNotification(
                resultSet.getObject("outbox_id", UUID.class),
                resultSet.getObject("inquiry_id", UUID.class),
                resultSet.getInt("attempts"),
                resultSet.getString("name_company"),
                resultSet.getString("email"),
                resultSet.getString("project_type"),
                resultSet.getString("requested_date"),
                resultSet.getString("location"),
                resultSet.getString("message"),
                resultSet.getString("locale"));
    }

    public record PendingNotification(
            UUID outboxId,
            UUID inquiryId,
            int attempts,
            String nameCompany,
            String email,
            String projectType,
            String requestedDate,
            String location,
            String message,
            String locale) {
    }
}
