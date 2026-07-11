package jp.co.tianho.api.media;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;
import jp.co.tianho.api.auth.AdministratorPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/media")
public class MediaLibraryController {

    private final MediaLibraryService mediaLibraryService;
    private final MediaUploadService mediaUploadService;

    public MediaLibraryController(MediaLibraryService mediaLibraryService, MediaUploadService mediaUploadService) {
        this.mediaLibraryService = mediaLibraryService;
        this.mediaUploadService = mediaUploadService;
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

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    MediaAssetResponse upload(
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal AdministratorPrincipal actor,
            HttpServletRequest request) {
        return mediaUploadService.upload(file, actor, request.getRemoteAddr());
    }
}
