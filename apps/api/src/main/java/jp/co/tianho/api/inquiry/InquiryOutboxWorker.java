package jp.co.tianho.api.inquiry;

import java.util.Map;
import jp.co.tianho.api.audit.AuditEventRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "tianho.inquiry.notifications.enabled", havingValue = "true")
public class InquiryOutboxWorker {

    private final InquiryOutboxRepository outboxRepository;
    private final InquiryNotificationSender notificationSender;
    private final AuditEventRepository auditEventRepository;

    public InquiryOutboxWorker(
            InquiryOutboxRepository outboxRepository,
            InquiryNotificationSender notificationSender,
            AuditEventRepository auditEventRepository) {
        this.outboxRepository = outboxRepository;
        this.notificationSender = notificationSender;
        this.auditEventRepository = auditEventRepository;
    }

    @Scheduled(fixedDelayString = "${tianho.inquiry.notifications.poll-delay:5000}")
    public void deliverNext() {
        outboxRepository.claimNext().ifPresent(notification -> {
            try {
                notificationSender.send(notification);
                outboxRepository.markSent(notification.outboxId());
                auditEventRepository.record(
                        null, "INQUIRY_NOTIFICATION_SENT", "INQUIRY", notification.inquiryId(), Map.of(), null);
            } catch (RuntimeException exception) {
                outboxRepository.markFailed(
                        notification.outboxId(), notification.attempts(), exception.getClass().getSimpleName());
            }
        });
    }
}
