package jp.co.tianho.api.media;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import jp.co.tianho.api.audit.AuditEventRepository;
import jp.co.tianho.api.auth.AdministratorPrincipal;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class MediaLifecycleService {

    private final JdbcClient jdbcClient;
    private final MediaAssetRepository assetRepository;
    private final MediaObjectStorage objectStorage;
    private final AuditEventRepository auditEventRepository;
    private final TransactionTemplate transactionTemplate;

    public MediaLifecycleService(
            JdbcClient jdbcClient,
            MediaAssetRepository assetRepository,
            MediaObjectStorage objectStorage,
            AuditEventRepository auditEventRepository,
            PlatformTransactionManager transactionManager) {
        this.jdbcClient = jdbcClient;
        this.assetRepository = assetRepository;
        this.objectStorage = objectStorage;
        this.auditEventRepository = auditEventRepository;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
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

    public void purge(UUID id, AdministratorPrincipal actor, String ipAddress) {
        CleanupTask cleanup = transactionTemplate.execute(status -> prepareCleanup(id, actor, ipAddress));
        if (cleanup == null) throw new IllegalStateException("Media cleanup could not be prepared");
        completeCleanup(cleanup);
    }

    @Scheduled(
            fixedDelayString = "${tianho.media.cleanup.retry-delay:3600000}",
            initialDelayString = "${tianho.media.cleanup.initial-delay:60000}")
    public void retryIncompleteCleanups() {
        List<CleanupTask> cleanups = jdbcClient.sql("""
                        SELECT id, object_key, thumbnail_key
                        FROM media_cleanup_records
                        WHERE result IN ('PENDING', 'FAILED')
                        ORDER BY cleaned_at, id
                        LIMIT 20
                        """)
                .query((resultSet, rowNumber) -> new CleanupTask(
                        resultSet.getObject("id", UUID.class),
                        resultSet.getString("object_key"),
                        resultSet.getString("thumbnail_key")))
                .list();
        cleanups.forEach(this::completeCleanup);
    }

    private CleanupTask prepareCleanup(UUID id, AdministratorPrincipal actor, String ipAddress) {
        StoredAsset asset = requireAsset(id);
        if (asset.status() != MediaAssetStatus.TRASHED
                || asset.purgeAfter() == null
                || asset.purgeAfter().isAfter(OffsetDateTime.now())) {
            throw new MediaLifecycleException("Media cannot be permanently removed before retention expires");
        }
        if (asset.referenceCount() > 0) {
            throw new MediaLifecycleException("Referenced media cannot be permanently removed");
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
        UUID cleanupId = recordCleanup(asset, "PENDING", null);
        auditEventRepository.record(
                actor.id(), "MEDIA_DELETED", "MEDIA_ASSET", id, Map.of(), ipAddress);
        return new CleanupTask(cleanupId, asset.objectKey(), asset.thumbnailKey());
    }

    private void completeCleanup(CleanupTask cleanup) {
        try {
            objectStorage.delete(cleanup.objectKey());
            objectStorage.delete(cleanup.thumbnailKey());
            updateCleanup(cleanup.id(), "DELETED", null);
        } catch (RuntimeException exception) {
            updateCleanup(cleanup.id(), "FAILED", "Object storage deletion will be retried");
        }
    }

    private StoredAsset requireAsset(UUID id) {
        StoredAsset asset = jdbcClient.sql("""
                        SELECT id, object_key, thumbnail_key, status, purge_after, 0 AS reference_count
                        FROM media_assets
                        WHERE id = :id AND status <> 'DELETED'
                        FOR UPDATE
                        """)
                .param("id", id)
                .query(this::mapStoredAsset)
                .optional()
                .orElseThrow(MediaAssetNotFoundException::new);
        long referenceCount = jdbcClient.sql("SELECT count(*) FROM media_references WHERE asset_id = :id")
                .param("id", id)
                .query(Long.class)
                .single();
        return new StoredAsset(
                asset.id(),
                asset.objectKey(),
                asset.thumbnailKey(),
                asset.status(),
                asset.purgeAfter(),
                referenceCount);
    }

    private UUID recordCleanup(StoredAsset asset, String result, String details) {
        UUID cleanupId = UUID.randomUUID();
        jdbcClient.sql("""
                        INSERT INTO media_cleanup_records (
                            id, asset_id, object_key, thumbnail_key, result, details
                        ) VALUES (
                            :id, :assetId, :objectKey, :thumbnailKey, :result, :details
                        )
                        """)
                .param("id", cleanupId)
                .param("assetId", asset.id())
                .param("objectKey", asset.objectKey())
                .param("thumbnailKey", asset.thumbnailKey())
                .param("result", result)
                .param("details", details, java.sql.Types.VARCHAR)
                .update();
        return cleanupId;
    }

    private void updateCleanup(UUID cleanupId, String result, String details) {
        jdbcClient.sql("""
                        UPDATE media_cleanup_records
                        SET result = :result, details = :details, cleaned_at = CURRENT_TIMESTAMP
                        WHERE id = :id AND result <> 'DELETED'
                        """)
                .param("id", cleanupId)
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

    private record CleanupTask(UUID id, String objectKey, String thumbnailKey) {
    }
}
