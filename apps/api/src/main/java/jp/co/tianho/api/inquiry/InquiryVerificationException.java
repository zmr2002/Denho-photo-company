package jp.co.tianho.api.inquiry;

public class InquiryVerificationException extends RuntimeException {

    InquiryVerificationException() {
        super("Inquiry verification failed");
    }
}
