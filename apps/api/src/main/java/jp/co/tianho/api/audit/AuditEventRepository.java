package jp.co.tianho.api.audit;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.ObjectMapper;

@Repository
public class AuditEventRepository {

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;

    public AuditEventRepository(JdbcClient jdbcClient, ObjectMapper objectMapper) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
    }

    public void record(
            UUID actorId,
            String eventType,
            String resourceType,
            UUID resourceId,
            Map<String, ?> details,
            String ipAddress) {
        jdbcClient.sql("""
                        INSERT INTO audit_events (
                            actor_id, event_type, resource_type, resource_id, details, ip_address
                        ) VALUES (
                            :actorId, :eventType, :resourceType, :resourceId, CAST(:details AS jsonb), :ipAddress
                        )
                        """)
                .param("actorId", actorId, Types.OTHER)
                .param("eventType", eventType)
                .param("resourceType", resourceType)
                .param("resourceId", resourceId, Types.OTHER)
                .param("details", objectMapper.writeValueAsString(details))
                .param("ipAddress", ipAddress, Types.VARCHAR)
                .update();
    }

    public List<AuditEventResponse> findRecent() {
        return jdbcClient.sql("""
                        SELECT event.id, event.event_type, event.resource_type, event.resource_id,
                               event.occurred_at,
                               COALESCE(administrator.display_name, '系统或已删除账户') AS actor_display_name
                        FROM audit_events event
                        LEFT JOIN administrator_users administrator ON administrator.id = event.actor_id
                        ORDER BY event.occurred_at DESC, event.id DESC
                        LIMIT 100
                        """)
                .query(this::mapEvent)
                .list();
    }

    private AuditEventResponse mapEvent(ResultSet resultSet, int rowNumber) throws SQLException {
        return new AuditEventResponse(
                resultSet.getObject("id", UUID.class),
                resultSet.getString("event_type"),
                resultSet.getString("resource_type"),
                resultSet.getObject("resource_id", UUID.class),
                resultSet.getString("actor_display_name"),
                resultSet.getObject("occurred_at", OffsetDateTime.class));
    }

    public record AuditEventResponse(
            UUID id,
            String eventType,
            String resourceType,
            UUID resourceId,
            String actorDisplayName,
            OffsetDateTime occurredAt) {
    }
}
