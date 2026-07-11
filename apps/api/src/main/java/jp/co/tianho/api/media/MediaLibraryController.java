package jp.co.tianho.api.media;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/media")
public class MediaLibraryController {

    private final MediaLibraryService mediaLibraryService;

    public MediaLibraryController(MediaLibraryService mediaLibraryService) {
        this.mediaLibraryService = mediaLibraryService;
    }

    @GetMapping
    List<MediaAssetResponse> findAssets(
            @RequestParam(defaultValue = "ACTIVE") MediaAssetStatus status) {
        return mediaLibraryService.findAssets(status);
    }

    @GetMapping("/{id}")
    MediaAssetResponse findAsset(@PathVariable UUID id) {
        return mediaLibraryService.findAsset(id);
    }
}
