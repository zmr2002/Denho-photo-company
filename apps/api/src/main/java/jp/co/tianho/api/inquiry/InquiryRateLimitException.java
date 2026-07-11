package jp.co.tianho.api.inquiry;

public class InquiryRateLimitException extends RuntimeException {

    InquiryRateLimitException() {
        super("Too many inquiry requests were received");
    }
}
