package jp.co.tianho.api.content.publicapi;

public class ContentNotFoundException extends RuntimeException {

    public ContentNotFoundException(String contentType, String locale, String slug) {
        super("Published %s was not found for locale %s and slug %s"
                .formatted(contentType, locale, slug));
    }
}
