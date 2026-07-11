package jp.co.tianho.api.auth;

import java.time.OffsetDateTime;
import java.util.UUID;

record AdministratorAccount(
        UUID id,
        String email,
        String displayName,
        String passwordHash,
        String passwordScheme,
        String role,
        boolean active,
        OffsetDateTime verifiedAt,
        int failedLoginCount,
        OffsetDateTime lockedUntil) {
}
