package jp.co.tianho.api.inquiry;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sesv2.SesV2Client;

@Configuration
@EnableScheduling
public class InquiryNotificationConfiguration {

    @Bean
    @ConditionalOnProperty(name = "tianho.inquiry.notifications.enabled", havingValue = "true")
    SesV2Client inquirySesClient(@Value("${tianho.inquiry.notifications.region}") String region) {
        return SesV2Client.builder().region(Region.of(region)).build();
    }
}
