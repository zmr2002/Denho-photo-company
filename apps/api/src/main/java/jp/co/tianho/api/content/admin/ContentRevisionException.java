package jp.co.tianho.api.content.admin;

public class ContentRevisionException extends RuntimeException {

    private final Reason reason;

    ContentRevisionException(Reason reason, String message) {
        super(message);
        this.reason = reason;
    }

    public Reason reason() {
        return reason;
    }

    public enum Reason {
        NOT_FOUND,
        CONFLICT
    }
}
