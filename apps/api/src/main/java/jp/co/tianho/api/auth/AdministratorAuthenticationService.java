package jp.co.tianho.api.auth;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class AdministratorAuthenticationService {

    private final AdministratorAccountRepository accountRepository;
    private final Argon2PasswordEncoder argon2PasswordEncoder;
    private final BCryptPasswordEncoder bcryptPasswordEncoder;
    private final String dummyPasswordHash;

    AdministratorAuthenticationService(
            AdministratorAccountRepository accountRepository,
            Argon2PasswordEncoder argon2PasswordEncoder,
            BCryptPasswordEncoder bcryptPasswordEncoder) {
        this.accountRepository = accountRepository;
        this.argon2PasswordEncoder = argon2PasswordEncoder;
        this.bcryptPasswordEncoder = bcryptPasswordEncoder;
        this.dummyPasswordHash = argon2PasswordEncoder.encode("not-a-user-password");
    }

    @Transactional(noRollbackFor = AuthenticationFailedException.class)
    AdministratorPrincipal authenticate(String rawEmail, String password, String ipAddress) {
        String email = rawEmail.strip().toLowerCase(Locale.ROOT);
        accountRepository.resetExpiredLock(email);
        AdministratorAccount account = accountRepository.findByEmail(email).orElse(null);

        if (account == null) {
            argon2PasswordEncoder.matches(password, dummyPasswordHash);
            accountRepository.recordAttempt(null, email, ipAddress, false, "INVALID_CREDENTIALS");
            throw new AuthenticationFailedException();
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (account.lockedUntil() != null && account.lockedUntil().isAfter(now)) {
            accountRepository.recordAttempt(account.id(), email, ipAddress, false, "LOCKED");
            throw new AuthenticationFailedException();
        }
        if (!account.active()) {
            accountRepository.recordAttempt(account.id(), email, ipAddress, false, "INACTIVE");
            throw new AuthenticationFailedException();
        }

        boolean validPassword = "BCRYPT".equals(account.passwordScheme())
                ? bcryptPasswordEncoder.matches(password, account.passwordHash())
                : argon2PasswordEncoder.matches(password, account.passwordHash());
        if (!validPassword) {
            accountRepository.recordFailedLogin(account.id());
            accountRepository.recordAttempt(account.id(), email, ipAddress, false, "INVALID_CREDENTIALS");
            throw new AuthenticationFailedException();
        }

        if ("BCRYPT".equals(account.passwordScheme())
                || argon2PasswordEncoder.upgradeEncoding(account.passwordHash())) {
            accountRepository.upgradePassword(account.id(), argon2PasswordEncoder.encode(password));
        }
        accountRepository.recordSuccessfulLogin(account.id());
        accountRepository.recordAttempt(account.id(), email, ipAddress, true, null);
        return new AdministratorPrincipal(
                account.id(), account.email(), account.displayName(), account.role());
    }
}
