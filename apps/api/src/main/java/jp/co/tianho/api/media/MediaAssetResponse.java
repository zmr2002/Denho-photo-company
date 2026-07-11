package jp.co.tianho.api.media;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MediaAssetResponse(
        UUID id,
        String originalFilename,
        String contentType,
        long byteSize,
        int width,
        int height,
        String sha256,
        MediaAssetStatus status,
        String url,
        String thumbnailUrl,
        long referenceCount,
        OffsetDateTime trashedAt,
        OffsetDateTime purgeAfter,
        OffsetDateTime createdAt) {
}
