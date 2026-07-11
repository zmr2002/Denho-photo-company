package jp.co.tianho.api.media;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MediaLibraryService {

    private final MediaAssetRepository assetRepository;

    public MediaLibraryService(MediaAssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    public List<MediaAssetResponse> findAssets(MediaAssetStatus status) {
        return assetRepository.findAll(status);
    }

    public MediaAssetResponse findAsset(UUID id) {
        return assetRepository.findById(id).orElseThrow(MediaAssetNotFoundException::new);
    }
}
