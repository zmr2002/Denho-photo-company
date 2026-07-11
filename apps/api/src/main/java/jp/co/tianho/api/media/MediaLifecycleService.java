package jp.co.tianho.api.media;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import jp.co.tianho.api.audit.AuditEventRepository;
import jp.co.tianho.api.auth.AdministratorPrincipal;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MediaLifecycleService {

    private final JdbcClient jdbcClient;
    private final MediaAssetRepository assetRepository;
    private final MediaObjectStorage objectStorage;
    private final AuditEventRepository auditEventRepository;

    public MediaLifecycleService(
            JdbcClient jdbcClient,
            MediaAssetRepository assetRepository,
            MediaObjectStorage objectStorage,
            AuditEventRepository auditEventRepository) {
        this.jdbcClient = jdbcClient;
        this.assetRepository = assetRepository;
        this.objectStorage = objectStorage;
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional
    public MediaAssetResponse trash(UUID id, AdministratorPrincipal actor, String ipAddress) {
        StoredAsset asset = requireAsset(id);
        if (asset.status() != MediaAssetStatus.ACTIVE) {
            throw new MediaLifecycleException("Only active media can be moved to the recycle bin");
        }
        if (asset.referenceCount() > 0) {
            throw new MediaLifecycleException("Referenced media cannot be moved to the recycle bin");
        }
        int updated = jdbcClient.sql("""
                        UPDATE media_assets SET status = 'TRASHED', trashed_at = CURRENT_TIMESTAMP,
                            purge_after = CURRENT_TIMESTAMP + INTERVAL '30 days', updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id AND status = 'ACTIVE'
                        """)
                .param("id", id)
                .update();
        requireUpdated(updated);
        auditEventRepository.record(
                actor.id(), "MEDIA_TRASHED", "MEDIA_ASSET", id, Map.of("retentionDays", 30), ipAddress);
        return assetRepository.findById(id).orElseThrow(MediaAssetNotFoundException::new);
    }

    @Transactional
    public MediaAssetResponse restore(UUID id, AdministratorPrincipal actor, String ipAddress) {
        StoredAsset asset = requireAsset(id);
        if (asset.status() != MediaAssetStatus.TRASHED) {
            throw new MediaLifecycleException("Only recycled media can be restored");
        }
        int updated = jdbcClient.sql("""
                        UPDATE media_assets SET status = 'ACTIVE', trashed_at = NULL, purge_after = NULL,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id AND status = 'TRASHED'
                        """)
                .param("id", id)
                .update();
        requireUpdated(updated);
        auditEventRepository.record(
                actor.id(), "MEDIA_RESTORED", "MEDIA_ASSET", id, Map.of(), ipAddress);
        return assetRepository.findById(id).orElseThrow(MediaAssetNotFoundException::new);
    }

    @Transactional
    public void purge(UUID id, AdministratorPrincipal actor, String ipAddress) {
        StoredAsset asset = requireAsset(id);
        if (asset.status() != MediaAssetStatus.TRASHED
                || asset.purgeAfter() == null
                || asset.purgeAfter().isAfter(OffsetDateTime.now())) {
            throw new MediaLifecycleException("Media cannot be permanently removed before retention expires");
        }
        if (asset.referenceCount() > 0) {
            throw new MediaLifecycleException("Referenced media cannot be permanently removed");
        }

        try {
            objectStorage.delete(asset.objectKey());
            objectStorage.delete(asset.thumbnailKey());
        } catch (RuntimeException exception) {
            recordCleanup(asset, "FAILED", "Object storage deletion failed");
            throw exception;
        }
        int updated = jdbcClient.sql("""
                        UPDATE media_assets SET status = 'DELETED', trashed_at = NULL, purge_after = NULL,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id AND status = 'TRASHED'
                          AND purge_after <= CURRENT_TIMESTAMP
                          AND NOT EXISTS (SELECT 1 FROM media_references WHERE asset_id = :id)
                        """)
                .param("id", id)
                .update();
        requireUpdated(updated);
        recordCleanup(asset, "DELETED", null);
        auditEventRepository.record(
                actor.id(), "MEDIA_DELETED", "MEDIA_ASSET", id, Map.of(), ipAddress);
    }

    private StoredAsset requireAsset(UUID id) {
        return jdbcClient.sql("""
                        SELECT asset.id, asset.object_key, asset.thumbnail_key, asset.status, asset.purge_after,
                               count(reference.id) AS reference_count
                        FROM media_assets asset
                        LEFT JOIN media_references reference ON reference.asset_id = asset.id
                        WHERE asset.id = :id AND asset.status <> 'DELETED'
                        GROUP BY asset.id
                        """)
                .param("id", id)
                .query(this::mapStoredAsset)
                .optional()
                .orElseThrow(MediaAssetNotFoundException::new);
    }

    private void recordCleanup(StoredAsset asset, String result, String details) {
        jdbcClient.sql("""
                        INSERT INTO media_cleanup_records (
                            asset_id, object_key, thumbnail_key, result, details
                        ) VALUES (
                            :assetId, :objectKey, :thumbnailKey, :result, :details
                        )
                        """)
                .param("assetId", asset.id())
                .param("objectKey", asset.objectKey())
                .param("thumbnailKey", asset.thumbnailKey())
                .param("result", result)
                .param("details", details, java.sql.Types.VARCHAR)
                .update();
    }

    private void requireUpdated(int updated) {
        if (updated != 1) throw new MediaLifecycleException("Media state changed during the request");
    }

    private StoredAsset mapStoredAsset(ResultSet resultSet, int rowNumber) throws SQLException {
        return new StoredAsset(
                resultSet.getObject("id", UUID.class),
                resultSet.getString("object_key"),
                resultSet.getString("thumbnail_key"),
                MediaAssetStatus.valueOf(resultSet.getString("status")),
                resultSet.getObject("purge_after", OffsetDateTime.class),
                resultSet.getLong("reference_count"));
    }

    private record StoredAsset(
            UUID id,
            String objectKey,
            String thumbnailKey,
            MediaAssetStatus status,
            OffsetDateTime purgeAfter,
            long referenceCount) {
    }
}
