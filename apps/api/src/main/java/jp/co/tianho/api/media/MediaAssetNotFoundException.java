package jp.co.tianho.api.media;

public class MediaAssetNotFoundException extends RuntimeException {

    MediaAssetNotFoundException() {
        super("Media asset was not found");
    }
}
