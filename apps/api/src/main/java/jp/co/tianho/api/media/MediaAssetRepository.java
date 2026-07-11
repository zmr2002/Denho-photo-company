package jp.co.tianho.api.media;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class MediaAssetRepository {

    private final JdbcClient jdbcClient;
    private final String publicBaseUrl;

    public MediaAssetRepository(
            JdbcClient jdbcClient,
            @Value("${tianho.media.public-base-url:/media}") String publicBaseUrl) {
        this.jdbcClient = jdbcClient;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/$", "");
    }

    public List<MediaAssetResponse> findAll(MediaAssetStatus status) {
        return jdbcClient.sql("""
                        SELECT asset.*, count(reference.id) AS reference_count
                        FROM media_assets asset
                        LEFT JOIN media_references reference ON reference.asset_id = asset.id
                        WHERE asset.status = CAST(:status AS media_asset_status)
                        GROUP BY asset.id
                        ORDER BY asset.created_at DESC, asset.id DESC
                        """)
                .param("status", status.name())
                .query(this::mapAsset)
                .list();
    }

    public Optional<MediaAssetResponse> findById(UUID id) {
        return jdbcClient.sql("""
                        SELECT asset.*, count(reference.id) AS reference_count
                        FROM media_assets asset
                        LEFT JOIN media_references reference ON reference.asset_id = asset.id
                        WHERE asset.id = :id AND asset.status <> 'DELETED'
                        GROUP BY asset.id
                        """)
                .param("id", id)
                .query(this::mapAsset)
                .optional();
    }

    private MediaAssetResponse mapAsset(ResultSet resultSet, int rowNumber) throws SQLException {
        return new MediaAssetResponse(
                resultSet.getObject("id", UUID.class),
                resultSet.getString("original_filename"),
                resultSet.getString("content_type"),
                resultSet.getLong("byte_size"),
                resultSet.getInt("width"),
                resultSet.getInt("height"),
                resultSet.getString("sha256"),
                MediaAssetStatus.valueOf(resultSet.getString("status")),
                publicUrl(resultSet.getString("object_key")),
                publicUrl(resultSet.getString("thumbnail_key")),
                resultSet.getLong("reference_count"),
                resultSet.getObject("trashed_at", OffsetDateTime.class),
                resultSet.getObject("purge_after", OffsetDateTime.class),
                resultSet.getObject("created_at", OffsetDateTime.class));
    }

    private String publicUrl(String objectKey) {
        return publicBaseUrl + "/" + objectKey;
    }
}
