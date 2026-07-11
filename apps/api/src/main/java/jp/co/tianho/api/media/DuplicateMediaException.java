package jp.co.tianho.api.media;

public class DuplicateMediaException extends RuntimeException {

    DuplicateMediaException() {
        super("An identical media asset already exists");
    }
}
