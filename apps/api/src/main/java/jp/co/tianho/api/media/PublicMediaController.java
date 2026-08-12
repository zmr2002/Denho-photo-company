package jp.co.tianho.api.media;

import java.time.Duration;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.S3Exception;

@RestController
@RequestMapping("/api/v1/public/media")
public class PublicMediaController {

    private static final Pattern FILENAME = Pattern.compile(
            "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|png)");

    private final MediaObjectStorage objectStorage;
    private final MediaAssetRepository assetRepository;

    public PublicMediaController(MediaObjectStorage objectStorage, MediaAssetRepository assetRepository) {
        this.objectStorage = objectStorage;
        this.assetRepository = assetRepository;
    }

    @GetMapping("/{variant}/{filename}")
    ResponseEntity<byte[]> read(
            @PathVariable String variant,
            @PathVariable String filename) {
        String normalizedFilename = filename.toLowerCase(Locale.ROOT);
        if (!(variant.equals("original") || variant.equals("thumbnail"))
                || !FILENAME.matcher(normalizedFilename).matches()) {
            throw new MediaAssetNotFoundException();
        }
        UUID assetId = UUID.fromString(normalizedFilename.substring(0, normalizedFilename.lastIndexOf('.')));
        MediaAssetResponse asset = assetRepository.findById(assetId)
                .filter(candidate -> candidate.status() == MediaAssetStatus.ACTIVE)
                .orElseThrow(MediaAssetNotFoundException::new);
        String expectedPath = variant.equals("original") ? asset.url() : asset.thumbnailUrl();
        if (!expectedPath.endsWith("/" + variant + "/" + normalizedFilename)) {
            throw new MediaAssetNotFoundException();
        }
        try {
            byte[] bytes = objectStorage.get(variant + "/" + normalizedFilename);
            MediaType contentType = normalizedFilename.endsWith(".png")
                    ? MediaType.IMAGE_PNG
                    : MediaType.IMAGE_JPEG;
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                    .contentType(contentType)
                    .contentLength(bytes.length)
                    .body(bytes);
        } catch (NoSuchKeyException exception) {
            throw new MediaAssetNotFoundException();
        } catch (S3Exception exception) {
            if (exception.statusCode() == 404) throw new MediaAssetNotFoundException();
            throw exception;
        }
    }
}
