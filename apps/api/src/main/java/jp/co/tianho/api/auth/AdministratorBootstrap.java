package jp.co.tianho.api.auth;

import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Component
@ConditionalOnProperty(name = "tianho.auth.bootstrap.enabled", havingValue = "true")
class AdministratorBootstrap implements ApplicationRunner {

    private final AdministratorAccountRepository accountRepository;
    private final Argon2PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;
    private final String displayName;

    AdministratorBootstrap(
            AdministratorAccountRepository accountRepository,
            Argon2PasswordEncoder passwordEncoder,
            @Value("${tianho.auth.bootstrap.email:}") String email,
            @Value("${tianho.auth.bootstrap.password:}") String password,
            @Value("${tianho.auth.bootstrap.display-name:Administrator}") String displayName) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
        this.displayName = displayName;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(password) || password.length() < 16) {
            throw new IllegalStateException("Administrator bootstrap credentials are incomplete");
        }
        accountRepository.createBootstrapAdministrator(
                email.strip().toLowerCase(Locale.ROOT), displayName.strip(), passwordEncoder.encode(password));
    }
}
