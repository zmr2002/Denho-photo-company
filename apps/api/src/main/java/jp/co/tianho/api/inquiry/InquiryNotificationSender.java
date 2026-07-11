package jp.co.tianho.api.inquiry;

interface InquiryNotificationSender {

    void send(InquiryOutboxRepository.PendingNotification notification);
}
