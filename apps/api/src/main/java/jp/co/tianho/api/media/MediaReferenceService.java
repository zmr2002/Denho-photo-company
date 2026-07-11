package jp.co.tianho.api.media;

import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

@Service
public class MediaReferenceService {

    private static final String MEDIA_PREFIX = "/media/";

    private final JdbcClient jdbcClient;

    public MediaReferenceService(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public void replaceReferences(
            String resourceType,
            UUID resourceId,
            Map<String, String> fields) {
        jdbcClient.sql("DELETE FROM media_references WHERE resource_type = :resourceType AND resource_id = :resourceId")
                .param("resourceType", resourceType)
                .param("resourceId", resourceId)
                .update();
        fields.forEach((fieldName, path) -> addReference(resourceType, resourceId, fieldName, path));
    }

    private void addReference(String resourceType, UUID resourceId, String fieldName, String path) {
        if (path == null || !path.startsWith(MEDIA_PREFIX)) return;
        String objectKey = path.substring(MEDIA_PREFIX.length());
        if (objectKey.startsWith("thumbnail/")) {
            objectKey = "original/" + objectKey.substring("thumbnail/".length());
        }
        int inserted = jdbcClient.sql("""
                        INSERT INTO media_references (asset_id, resource_type, resource_id, field_name)
                        SELECT id, :resourceType, :resourceId, :fieldName
                        FROM media_assets
                        WHERE object_key = :objectKey AND status = 'ACTIVE'
                        """)
                .param("resourceType", resourceType)
                .param("resourceId", resourceId)
                .param("fieldName", fieldName)
                .param("objectKey", objectKey)
                .update();
        if (inserted != 1) {
            throw new MediaLifecycleException("Content references an unavailable media asset");
        }
    }
}
