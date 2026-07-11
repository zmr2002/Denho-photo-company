package jp.co.tianho.api.auth;

public class AuthenticationFailedException extends RuntimeException {

    public AuthenticationFailedException() {
        super("Email, password, or account state is invalid");
    }
}
