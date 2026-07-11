package jp.co.tianho.api.inquiry;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.Body;
import software.amazon.awssdk.services.sesv2.model.Content;
import software.amazon.awssdk.services.sesv2.model.Destination;
import software.amazon.awssdk.services.sesv2.model.EmailContent;
import software.amazon.awssdk.services.sesv2.model.Message;
import software.amazon.awssdk.services.sesv2.model.SendEmailRequest;

@Component
@ConditionalOnProperty(name = "tianho.inquiry.notifications.enabled", havingValue = "true")
class SesInquiryNotificationSender implements InquiryNotificationSender {

    private final SesV2Client client;
    private final String fromAddress;
    private final String toAddress;

    SesInquiryNotificationSender(
            SesV2Client client,
            @Value("${tianho.inquiry.notifications.from-address}") String fromAddress,
            @Value("${tianho.inquiry.notifications.to-address}") String toAddress) {
        this.client = client;
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
    }

    @Override
    public void send(InquiryOutboxRepository.PendingNotification notification) {
        String body = """
                New website inquiry

                Name or company: %s
                Email: %s
                Project type: %s
                Requested date: %s
                Location: %s
                Language: %s

                %s
                """.formatted(
                notification.nameCompany(),
                notification.email(),
                notification.projectType(),
                optional(notification.requestedDate()),
                optional(notification.location()),
                notification.locale(),
                notification.message());
        client.sendEmail(SendEmailRequest.builder()
                .fromEmailAddress(fromAddress)
                .destination(Destination.builder().toAddresses(toAddress).build())
                .content(EmailContent.builder()
                        .simple(Message.builder()
                                .subject(Content.builder().data("New website inquiry").charset("UTF-8").build())
                                .body(Body.builder()
                                        .text(Content.builder().data(body).charset("UTF-8").build())
                                        .build())
                                .build())
                        .build())
                .build());
    }

    private String optional(String value) {
        return value == null ? "Not provided" : value;
    }
}
