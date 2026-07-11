package jp.co.tianho.api.auth;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
class MfaSecretEncryption {

    private final String encodedKey;
    private final SecureRandom secureRandom = new SecureRandom();

    MfaSecretEncryption(@Value("${tianho.auth.mfa.encryption-key:}") String encodedKey) {
        this.encodedKey = encodedKey;
    }

    EncryptedSecret encrypt(String secret) {
        try {
            byte[] iv = new byte[12];
            secureRandom.nextBytes(iv);
            Cipher cipher = cipher(Cipher.ENCRYPT_MODE, iv);
            return new EncryptedSecret(iv, cipher.doFinal(secret.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("TOTP secret encryption failed", exception);
        }
    }

    String decrypt(byte[] iv, byte[] ciphertext) {
        try {
            Cipher cipher = cipher(Cipher.DECRYPT_MODE, iv);
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("TOTP secret decryption failed", exception);
        }
    }

    private Cipher cipher(int mode, byte[] iv) throws GeneralSecurityException {
        if (!StringUtils.hasText(encodedKey)) {
            throw new IllegalStateException("MFA encryption key is not configured");
        }
        byte[] key = Base64.getDecoder().decode(encodedKey);
        if (key.length != 32) {
            throw new IllegalStateException("MFA encryption key must contain 32 bytes");
        }
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(mode, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv));
        return cipher;
    }

    record EncryptedSecret(byte[] iv, byte[] ciphertext) {
    }
}
