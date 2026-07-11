package jp.co.tianho.api.inquiry;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import jp.co.tianho.api.audit.AuditEventRepository;
import jp.co.tianho.api.auth.AdministratorPrincipal;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InquiryService {

    private final JdbcClient jdbcClient;
    private final AuditEventRepository auditEventRepository;

    public InquiryService(JdbcClient jdbcClient, AuditEventRepository auditEventRepository) {
        this.jdbcClient = jdbcClient;
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional
    public PublicInquiryResponse create(PublicInquiryRequest request) {
        UUID id = UUID.randomUUID();
        jdbcClient.sql("""
                        INSERT INTO inquiries (
                            id, idempotency_key, name_company, email, project_type, requested_date,
                            location, message, locale, consent_version, consented_at
                        ) VALUES (
                            :id, :idempotencyKey, :nameCompany, :email, :projectType, :requestedDate,
                            :location, :message, :locale, :consentVersion, CURRENT_TIMESTAMP
                        ) ON CONFLICT (idempotency_key) DO NOTHING
                        """)
                .param("id", id)
                .param("idempotencyKey", request.idempotencyKey())
                .param("nameCompany", request.nameCompany().strip())
                .param("email", request.email().strip().toLowerCase(Locale.ROOT))
                .param("projectType", request.projectType().strip())
                .param("requestedDate", normalizeOptional(request.requestedDate()), Types.VARCHAR)
                .param("location", normalizeOptional(request.location()), Types.VARCHAR)
                .param("message", request.message().strip())
                .param("locale", request.locale())
                .param("consentVersion", request.consentVersion())
                .update();
        return findPublic(request.idempotencyKey());
    }

    @Transactional(readOnly = true)
    public List<InquiryResponse> findAll(InquiryStatus status) {
        return jdbcClient.sql("""
                        SELECT id, name_company, email, project_type, requested_date, location,
                               message, locale, status, consent_version, consented_at, created_at, updated_at
                        FROM inquiries WHERE status = CAST(:status AS inquiry_status)
                        ORDER BY created_at DESC, id DESC
                        """)
                .param("status", status.name())
                .query(this::mapInquiry)
                .list();
    }

    @Transactional
    public InquiryResponse changeStatus(
            UUID id,
            InquiryStatus status,
            AdministratorPrincipal actor,
            String ipAddress) {
        if (status == InquiryStatus.ANONYMIZED) {
            throw new IllegalArgumentException("Anonymization is managed by retention cleanup");
        }
        int updated = jdbcClient.sql("""
                        UPDATE inquiries SET status = CAST(:status AS inquiry_status), updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id AND status <> 'ANONYMIZED'
                        """)
                .param("id", id)
                .param("status", status.name())
                .update();
        if (updated != 1) throw new InquiryNotFoundException();
        auditEventRepository.record(
                actor.id(), "INQUIRY_STATUS_CHANGED", "INQUIRY", id,
                Map.of("status", status.name()), ipAddress);
        return findOne(id);
    }

    private PublicInquiryResponse findPublic(UUID idempotencyKey) {
        return jdbcClient.sql("""
                        SELECT id, status, created_at FROM inquiries WHERE idempotency_key = :idempotencyKey
                        """)
                .param("idempotencyKey", idempotencyKey)
                .query((resultSet, rowNumber) -> new PublicInquiryResponse(
                        resultSet.getObject("id", UUID.class),
                        InquiryStatus.valueOf(resultSet.getString("status")),
                        resultSet.getObject("created_at", OffsetDateTime.class)))
                .single();
    }

    private InquiryResponse findOne(UUID id) {
        return jdbcClient.sql("""
                        SELECT id, name_company, email, project_type, requested_date, location,
                               message, locale, status, consent_version, consented_at, created_at, updated_at
                        FROM inquiries WHERE id = :id
                        """)
                .param("id", id)
                .query(this::mapInquiry)
                .optional()
                .orElseThrow(InquiryNotFoundException::new);
    }

    private InquiryResponse mapInquiry(ResultSet resultSet, int rowNumber) throws SQLException {
        return new InquiryResponse(
                resultSet.getObject("id", UUID.class),
                resultSet.getString("name_company"),
                resultSet.getString("email"),
                resultSet.getString("project_type"),
                resultSet.getString("requested_date"),
                resultSet.getString("location"),
                resultSet.getString("message"),
                resultSet.getString("locale"),
                InquiryStatus.valueOf(resultSet.getString("status")),
                resultSet.getString("consent_version"),
                resultSet.getObject("consented_at", OffsetDateTime.class),
                resultSet.getObject("created_at", OffsetDateTime.class),
                resultSet.getObject("updated_at", OffsetDateTime.class));
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }

    public record PublicInquiryResponse(UUID id, InquiryStatus status, OffsetDateTime receivedAt) {
    }

    public record InquiryResponse(
            UUID id,
            String nameCompany,
            String email,
            String projectType,
            String requestedDate,
            String location,
            String message,
            String locale,
            InquiryStatus status,
            String consentVersion,
            OffsetDateTime consentedAt,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt) {
    }
}
