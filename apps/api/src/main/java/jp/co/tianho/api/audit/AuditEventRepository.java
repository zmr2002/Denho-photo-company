package jp.co.tianho.api.audit;

import java.sql.Types;
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
}
