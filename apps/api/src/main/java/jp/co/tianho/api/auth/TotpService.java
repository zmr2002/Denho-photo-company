package jp.co.tianho.api.auth;

import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.Instant;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

@Service
class TotpService {

    private static final int PERIOD_SECONDS = 30;
    private final SecureRandom secureRandom = new SecureRandom();

    String newSecret() {
        byte[] secret = new byte[20];
        secureRandom.nextBytes(secret);
        return Base32Codec.encode(secret);
    }

    boolean verify(String secret, String code, Instant now) {
        if (code == null || !code.matches("\\d{6}")) {
            return false;
        }
        long counter = now.getEpochSecond() / PERIOD_SECONDS;
        for (long offset = -1; offset <= 1; offset++) {
            if (code(secret, counter + offset).equals(code)) {
                return true;
            }
        }
        return false;
    }

    String currentCode(String secret, Instant now) {
        return code(secret, now.getEpochSecond() / PERIOD_SECONDS);
    }

    private String code(String secret, long counter) {
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(Base32Codec.decode(secret), "HmacSHA1"));
            byte[] hash = mac.doFinal(ByteBuffer.allocate(Long.BYTES).putLong(counter).array());
            int offset = hash[hash.length - 1] & 0x0f;
            int binary = ((hash[offset] & 0x7f) << 24)
                    | ((hash[offset + 1] & 0xff) << 16)
                    | ((hash[offset + 2] & 0xff) << 8)
                    | (hash[offset + 3] & 0xff);
            return "%06d".formatted(binary % 1_000_000);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("TOTP calculation failed", exception);
        }
    }
}
