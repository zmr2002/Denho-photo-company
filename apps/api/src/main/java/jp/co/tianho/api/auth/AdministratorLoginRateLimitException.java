package jp.co.tianho.api.auth;

public class AdministratorLoginRateLimitException extends RuntimeException {

    public AdministratorLoginRateLimitException() {
        super("Too many login attempts. Try again later.");
    }
}
