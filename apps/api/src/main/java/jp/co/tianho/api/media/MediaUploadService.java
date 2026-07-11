package jp.co.tianho.api.media;

import java.util.Map;
import java.util.UUID;
import jp.co.tianho.api.audit.AuditEventRepository;
import jp.co.tianho.api.auth.AdministratorPrincipal;
import jp.co.tianho.api.media.ImageUploadProcessor.ProcessedImage;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MediaUploadService {

    private final ImageUploadProcessor imageProcessor;
    private final MediaObjectStorage objectStorage;
    private final MediaAssetRepository assetRepository;
    private final JdbcClient jdbcClient;
    private final AuditEventRepository auditEventRepository;

    public MediaUploadService(
            ImageUploadProcessor imageProcessor,
            MediaObjectStorage objectStorage,
            MediaAssetRepository assetRepository,
            JdbcClient jdbcClient,
            AuditEventRepository auditEventRepository) {
        this.imageProcessor = imageProcessor;
        this.objectStorage = objectStorage;
        this.assetRepository = assetRepository;
        this.jdbcClient = jdbcClient;
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional
    public MediaAssetResponse upload(
            MultipartFile file,
            AdministratorPrincipal actor,
            String ipAddress) {
        ProcessedImage image = imageProcessor.process(file);
        Long duplicates = jdbcClient.sql("SELECT count(*) FROM media_assets WHERE sha256 = :sha256")
                .param("sha256", image.sha256())
                .query(Long.class)
                .single();
        if (duplicates > 0) throw new DuplicateMediaException();

        UUID id = UUID.randomUUID();
        String objectKey = "original/" + id + "." + image.extension();
        String thumbnailKey = "thumbnail/" + id + "." + image.extension();
        boolean originalStored = false;
        boolean thumbnailStored = false;
        try {
            objectStorage.put(objectKey, image.contentType(), image.masterBytes());
            originalStored = true;
            objectStorage.put(thumbnailKey, image.contentType(), image.thumbnailBytes());
            thumbnailStored = true;
            jdbcClient.sql("""
                            INSERT INTO media_assets (
                                id, object_key, thumbnail_key, original_filename, content_type,
                                byte_size, width, height, sha256, created_by
                            ) VALUES (
                                :id, :objectKey, :thumbnailKey, :originalFilename, :contentType,
                                :byteSize, :width, :height, :sha256, :createdBy
                            )
                            """)
                    .param("id", id)
                    .param("objectKey", objectKey)
                    .param("thumbnailKey", thumbnailKey)
                    .param("originalFilename", image.originalFilename())
                    .param("contentType", image.contentType())
                    .param("byteSize", image.masterBytes().length)
                    .param("width", image.width())
                    .param("height", image.height())
                    .param("sha256", image.sha256())
                    .param("createdBy", actor.id())
                    .update();
        } catch (DuplicateKeyException exception) {
            deleteStoredObjects(objectKey, thumbnailKey, originalStored, thumbnailStored);
            throw new DuplicateMediaException();
        } catch (RuntimeException exception) {
            deleteStoredObjects(objectKey, thumbnailKey, originalStored, thumbnailStored);
            throw exception;
        }
        auditEventRepository.record(
                actor.id(), "MEDIA_UPLOADED", "MEDIA_ASSET", id,
                Map.of("contentType", image.contentType(), "byteSize", image.masterBytes().length), ipAddress);
        return assetRepository.findById(id).orElseThrow(MediaAssetNotFoundException::new);
    }

    private void deleteStoredObjects(
            String objectKey,
            String thumbnailKey,
            boolean originalStored,
            boolean thumbnailStored) {
        if (thumbnailStored) objectStorage.delete(thumbnailKey);
        if (originalStored) objectStorage.delete(objectKey);
    }
}
