package jp.co.tianho.api.inquiry;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class InquiryProtectionService {

    private final JdbcClient jdbcClient;
    private final TurnstileVerifier turnstileVerifier;
    private final String ipHashKey;
    private final TransactionTemplate transactionTemplate;

    public InquiryProtectionService(
            JdbcClient jdbcClient,
            TurnstileVerifier turnstileVerifier,
            PlatformTransactionManager transactionManager,
            @Value("${tianho.inquiry.ip-hash-key}") String ipHashKey) {
        this.jdbcClient = jdbcClient;
        this.turnstileVerifier = turnstileVerifier;
        this.ipHashKey = ipHashKey;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    public String verify(String remoteAddress, String turnstileToken) {
        String ipHash = hashAddress(remoteAddress);
        Integer requestCount = transactionTemplate.execute(status -> jdbcClient.sql("""
                        INSERT INTO inquiry_request_buckets (ip_hash, bucket_start, request_count)
                        VALUES (
                            :ipHash,
                            to_timestamp(floor(extract(epoch FROM CURRENT_TIMESTAMP) / 900) * 900),
                            1
                        )
                        ON CONFLICT (ip_hash, bucket_start) DO UPDATE
                        SET request_count = inquiry_request_buckets.request_count + 1,
                            updated_at = CURRENT_TIMESTAMP
                        RETURNING request_count
                        """)
                .param("ipHash", ipHash)
                .query(Integer.class)
                .single());
        if (requestCount == null) throw new IllegalStateException("Inquiry rate limit could not be updated");
        if (requestCount > 5) throw new InquiryRateLimitException();
        turnstileVerifier.verify(turnstileToken, remoteAddress);
        return ipHash;
    }

    @Scheduled(cron = "0 20 3 * * *")
    @Transactional
    public void removeExpiredBuckets() {
        jdbcClient.sql("DELETE FROM inquiry_request_buckets WHERE bucket_start < CURRENT_TIMESTAMP - INTERVAL '1 day'")
                .update();
    }

    private String hashAddress(String remoteAddress) {
        if (ipHashKey.isBlank()) throw new IllegalStateException("Inquiry IP hash key is not configured");
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(ipHashKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(remoteAddress.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Inquiry IP hashing failed", exception);
        }
    }
}
