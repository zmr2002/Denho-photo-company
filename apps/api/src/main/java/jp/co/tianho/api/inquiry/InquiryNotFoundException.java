package jp.co.tianho.api.inquiry;

public class InquiryNotFoundException extends RuntimeException {

    InquiryNotFoundException() {
        super("Inquiry was not found");
    }
}
