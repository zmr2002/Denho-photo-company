package jp.co.tianho.api.auth;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import jp.co.tianho.api.audit.AuditEventRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class MfaService {

    private final MfaChallengeRepository challengeRepository;
    private final MfaSecretEncryption encryption;
    private final TotpService totpService;
    private final AuditEventRepository auditEventRepository;
    private final Duration challengeTimeout;
    private final String issuer;
    private final SecureRandom secureRandom = new SecureRandom();

    MfaService(
            MfaChallengeRepository challengeRepository,
            MfaSecretEncryption encryption,
            TotpService totpService,
            AuditEventRepository auditEventRepository,
            @Value("${tianho.auth.mfa.challenge-timeout:5m}") Duration challengeTimeout,
            @Value("${tianho.auth.mfa.issuer:Tianho}") String issuer) {
        this.challengeRepository = challengeRepository;
        this.encryption = encryption;
        this.totpService = totpService;
        this.auditEventRepository = auditEventRepository;
        this.challengeTimeout = challengeTimeout;
        this.issuer = issuer;
    }

    @Transactional
    ChallengeResponse begin(AdministratorPrincipal principal, boolean mfaEnabled) {
        UUID challengeId = UUID.randomUUID();
        MfaSecretEncryption.EncryptedSecret pendingSecret = null;
        if (!mfaEnabled) {
            pendingSecret = encryption.encrypt(totpService.newSecret());
        }
        challengeRepository.create(
                challengeId,
                principal.id(),
                mfaEnabled ? "VERIFY" : "SETUP",
                pendingSecret == null ? null : pendingSecret.ciphertext(),
                pendingSecret == null ? null : pendingSecret.iv(),
                OffsetDateTime.now(ZoneOffset.UTC).plus(challengeTimeout));
        return new ChallengeResponse(challengeId, true, !mfaEnabled);
    }

    @Transactional(readOnly = true)
    BindingResponse binding(UUID challengeId) {
        MfaChallengeRepository.MfaChallenge challenge = requireChallenge(challengeId);
        if (!"SETUP".equals(challenge.purpose())) {
            throw new MfaVerificationException("This challenge does not allow TOTP binding");
        }
        String secret = encryption.decrypt(challenge.pendingIv(), challenge.pendingCiphertext());
        String label = url(issuer + ":" + challenge.email());
        String uri = "otpauth://totp/%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30"
                .formatted(label, secret, url(issuer));
        return new BindingResponse(secret, uri);
    }

    @Transactional(noRollbackFor = MfaVerificationException.class)
    VerificationResult verify(UUID challengeId, String code, String ipAddress) {
        MfaChallengeRepository.MfaChallenge challenge = requireChallenge(challengeId);
        String secret = "SETUP".equals(challenge.purpose())
                ? encryption.decrypt(challenge.pendingIv(), challenge.pendingCiphertext())
                : encryption.decrypt(challenge.secretIv(), challenge.secretCiphertext());
        if (!totpService.verify(secret, code, Instant.now())) {
            challengeRepository.recordFailure(challengeId);
            throw new MfaVerificationException("TOTP verification failed");
        }

        List<String> recoveryCodes = List.of();
        if ("SETUP".equals(challenge.purpose())) {
            challengeRepository.enableMfa(
                    challenge.administratorId(), challenge.pendingCiphertext(), challenge.pendingIv());
            recoveryCodes = newRecoveryCodes();
            challengeRepository.replaceRecoveryCodes(
                    challenge.administratorId(), recoveryCodes.stream().map(this::hashRecoveryCode).toList());
            auditEventRepository.record(
                    challenge.administratorId(), "MFA_BOUND", "ADMINISTRATOR_USER",
                    challenge.administratorId(), Map.of(), ipAddress);
        }
        challengeRepository.complete(challengeId);
        auditEventRepository.record(
                challenge.administratorId(), "MFA_VERIFIED", "ADMINISTRATOR_USER",
                challenge.administratorId(), Map.of("method", "TOTP"), ipAddress);
        return new VerificationResult(challenge.principal(), recoveryCodes);
    }

    @Transactional(noRollbackFor = MfaVerificationException.class)
    VerificationResult recover(UUID challengeId, String recoveryCode, String ipAddress) {
        MfaChallengeRepository.MfaChallenge challenge = requireChallenge(challengeId);
        if (!"VERIFY".equals(challenge.purpose())
                || !challengeRepository.consumeRecoveryCode(
                        challenge.administratorId(), hashRecoveryCode(recoveryCode))) {
            challengeRepository.recordFailure(challengeId);
            throw new MfaVerificationException("Recovery code verification failed");
        }
        challengeRepository.complete(challengeId);
        auditEventRepository.record(
                challenge.administratorId(), "MFA_VERIFIED", "ADMINISTRATOR_USER",
                challenge.administratorId(), Map.of("method", "RECOVERY_CODE"), ipAddress);
        return new VerificationResult(challenge.principal(), List.of());
    }

    private MfaChallengeRepository.MfaChallenge requireChallenge(UUID challengeId) {
        return challengeRepository.findActive(challengeId)
                .orElseThrow(() -> new MfaVerificationException("MFA challenge is invalid or expired"));
    }

    private List<String> newRecoveryCodes() {
        List<String> codes = new ArrayList<>();
        for (int index = 0; index < 10; index++) {
            byte[] value = new byte[8];
            secureRandom.nextBytes(value);
            String encoded = Base32Codec.encode(value);
            codes.add(encoded.substring(0, 4) + "-" + encoded.substring(4, 8) + "-" + encoded.substring(8, 12));
        }
        return List.copyOf(codes);
    }

    private String hashRecoveryCode(String code) {
        try {
            String normalized = code.replace("-", "").strip().toUpperCase(Locale.ROOT);
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(normalized.getBytes(StandardCharsets.US_ASCII)));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Recovery code hashing failed", exception);
        }
    }

    private String url(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    record ChallengeResponse(UUID challengeId, boolean mfaRequired, boolean setupRequired) {
    }

    record BindingResponse(String secret, String provisioningUri) {
    }

    record VerificationResult(AdministratorPrincipal principal, List<String> recoveryCodes) {
    }
}
