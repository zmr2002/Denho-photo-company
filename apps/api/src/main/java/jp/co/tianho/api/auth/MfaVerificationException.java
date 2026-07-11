package jp.co.tianho.api.auth;

public class MfaVerificationException extends RuntimeException {

    public MfaVerificationException(String message) {
        super(message);
    }
}
