package jp.co.tianho.api.content.admin;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import jp.co.tianho.api.audit.AuditEventRepository;
import jp.co.tianho.api.auth.AdministratorPrincipal;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class ContentRevisionService {

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;
    private final AuditEventRepository auditEventRepository;

    public ContentRevisionService(
            JdbcClient jdbcClient,
            ObjectMapper objectMapper,
            AuditEventRepository auditEventRepository) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional(readOnly = true)
    public List<RevisionResponse> findRevisions(ResourceType resourceType, UUID resourceId) {
        requireCurrent(resourceType, resourceId);
        return jdbcClient.sql("""
                        SELECT id, version, action, snapshot, actor_id, created_at
                        FROM content_revisions
                        WHERE resource_type = :resourceType AND resource_id = :resourceId
                        ORDER BY version DESC
                        """)
                .param("resourceType", resourceType.name())
                .param("resourceId", resourceId)
                .query(this::mapRevision)
                .list();
    }

    @Transactional
    public ContentStateResponse changeState(
            ResourceType resourceType,
            UUID resourceId,
            long expectedVersion,
            ContentState targetState,
            AdministratorPrincipal actor,
            String ipAddress) {
        CurrentContent current = requireCurrent(resourceType, resourceId);
        if (current.version() != expectedVersion) {
            throw conflict("Content changed after it was loaded");
        }
        validateTransition(current.state(), targetState);

        int updated = jdbcClient.sql(updateStatement(resourceType, targetState))
                .param("id", resourceId)
                .param("expectedVersion", expectedVersion)
                .param("status", targetState.name())
                .update();
        if (updated != 1) {
            throw conflict("Content changed after it was loaded");
        }

        CurrentContent changed = requireCurrent(resourceType, resourceId);
        JsonNode snapshot = readSnapshot(resourceType, resourceId);
        String action = switch (targetState) {
            case PUBLISHED -> "PUBLISHED";
            case ARCHIVED -> "ARCHIVED";
            case DRAFT -> "RESTORED";
        };
        jdbcClient.sql("""
                        INSERT INTO content_revisions (
                            resource_type, resource_id, version, action, snapshot, actor_id
                        ) VALUES (
                            :resourceType, :resourceId, :version, :action, CAST(:snapshot AS jsonb), :actorId
                        )
                        """)
                .param("resourceType", resourceType.name())
                .param("resourceId", resourceId)
                .param("version", changed.version())
                .param("action", action)
                .param("snapshot", objectMapper.writeValueAsString(snapshot))
                .param("actorId", actor.id())
                .update();
        auditEventRepository.record(
                actor.id(), "CONTENT_" + action, resourceType.name(), resourceId,
                Map.of("version", changed.version(), "status", changed.state().name()), ipAddress);
        return new ContentStateResponse(
                resourceType, resourceId, changed.state(), changed.version(), changed.archivedAt(), changed.updatedAt());
    }

    public void recordChange(
            ResourceType resourceType,
            UUID resourceId,
            String action,
            AdministratorPrincipal actor,
            String ipAddress) {
        CurrentContent current = requireCurrent(resourceType, resourceId);
        JsonNode snapshot = readSnapshot(resourceType, resourceId);
        jdbcClient.sql("""
                        INSERT INTO content_revisions (
                            resource_type, resource_id, version, action, snapshot, actor_id
                        ) VALUES (
                            :resourceType, :resourceId, :version, :action, CAST(:snapshot AS jsonb), :actorId
                        )
                        """)
                .param("resourceType", resourceType.name())
                .param("resourceId", resourceId)
                .param("version", current.version())
                .param("action", action)
                .param("snapshot", objectMapper.writeValueAsString(snapshot))
                .param("actorId", actor.id())
                .update();
        auditEventRepository.record(
                actor.id(), "CONTENT_" + action, resourceType.name(), resourceId,
                Map.of("version", current.version(), "status", current.state().name()), ipAddress);
    }

    private CurrentContent requireCurrent(ResourceType resourceType, UUID resourceId) {
        return jdbcClient.sql("SELECT status, version, archived_at, updated_at FROM "
                        + resourceType.tableName() + " WHERE id = :id")
                .param("id", resourceId)
                .query((resultSet, rowNumber) -> new CurrentContent(
                        ContentState.valueOf(resultSet.getString("status")),
                        resultSet.getLong("version"),
                        resultSet.getObject("archived_at", OffsetDateTime.class),
                        resultSet.getObject("updated_at", OffsetDateTime.class)))
                .optional()
                .orElseThrow(() -> new ContentRevisionException(
                        ContentRevisionException.Reason.NOT_FOUND, "Content was not found"));
    }

    private JsonNode readSnapshot(ResourceType resourceType, UUID resourceId) {
        String statement = switch (resourceType) {
            case ARTICLE -> """
                    SELECT to_jsonb(article) || jsonb_build_object(
                        'blocks', COALESCE((
                            SELECT jsonb_agg(to_jsonb(block) ORDER BY block.sort_order, block.id)
                            FROM article_blocks block WHERE block.article_id = article.id
                        ), '[]'::jsonb)
                    ) FROM articles article WHERE article.id = :id
                    """;
            case WORK -> """
                    SELECT to_jsonb(work) || jsonb_build_object(
                        'images', COALESCE((
                            SELECT jsonb_agg(to_jsonb(image) ORDER BY image.sort_order, image.id)
                            FROM work_images image WHERE image.work_id = work.id
                        ), '[]'::jsonb)
                    ) FROM works work WHERE work.id = :id
                    """;
            case NOTICE -> "SELECT to_jsonb(notice) FROM opening_notices notice WHERE notice.id = :id";
        };
        String snapshot = jdbcClient.sql(statement)
                .param("id", resourceId)
                .query(String.class)
                .single();
        return objectMapper.readTree(snapshot);
    }

    private String updateStatement(ResourceType resourceType, ContentState targetState) {
        String publishedAt = resourceType == ResourceType.ARTICLE && targetState == ContentState.PUBLISHED
                ? ", published_at = COALESCE(published_at, CURRENT_TIMESTAMP)"
                : "";
        return "UPDATE " + resourceType.tableName() + " SET status = CAST(:status AS content_status), "
                + "version = version + 1, updated_at = CURRENT_TIMESTAMP, archived_at = "
                + (targetState == ContentState.ARCHIVED ? "CURRENT_TIMESTAMP" : "NULL")
                + publishedAt + " WHERE id = :id AND version = :expectedVersion";
    }

    private void validateTransition(ContentState currentState, ContentState targetState) {
        boolean valid = switch (targetState) {
            case PUBLISHED -> currentState == ContentState.DRAFT;
            case ARCHIVED -> currentState != ContentState.ARCHIVED;
            case DRAFT -> currentState == ContentState.ARCHIVED;
        };
        if (!valid) {
            throw conflict("Content cannot move from " + currentState + " to " + targetState);
        }
    }

    private ContentRevisionException conflict(String message) {
        return new ContentRevisionException(ContentRevisionException.Reason.CONFLICT, message);
    }

    private RevisionResponse mapRevision(ResultSet resultSet, int rowNumber) throws SQLException {
        return new RevisionResponse(
                resultSet.getObject("id", UUID.class),
                resultSet.getLong("version"),
                resultSet.getString("action"),
                objectMapper.readTree(resultSet.getString("snapshot")),
                resultSet.getObject("actor_id", UUID.class),
                resultSet.getObject("created_at", OffsetDateTime.class));
    }

    private record CurrentContent(
            ContentState state,
            long version,
            OffsetDateTime archivedAt,
            OffsetDateTime updatedAt) {
    }

    public record RevisionResponse(
            UUID id,
            long version,
            String action,
            JsonNode snapshot,
            UUID actorId,
            OffsetDateTime createdAt) {
    }

    public record ContentStateResponse(
            ResourceType resourceType,
            UUID id,
            ContentState status,
            long version,
            OffsetDateTime archivedAt,
            OffsetDateTime updatedAt) {
    }

    public enum ResourceType {
        ARTICLE("articles"),
        WORK("works"),
        NOTICE("opening_notices");

        private final String tableName;

        ResourceType(String tableName) {
            this.tableName = tableName;
        }

        String tableName() {
            return tableName;
        }
    }

    public enum ContentState {
        DRAFT,
        PUBLISHED,
        ARCHIVED
    }
}
