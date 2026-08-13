package jp.co.tianho.api.auth;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import jp.co.tianho.api.audit.AuditEventRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdministratorUserService {

    private final JdbcClient jdbcClient;
    private final Argon2PasswordEncoder passwordEncoder;
    private final AuditEventRepository auditEventRepository;

    public AdministratorUserService(
            JdbcClient jdbcClient,
            Argon2PasswordEncoder passwordEncoder,
            AuditEventRepository auditEventRepository) {
        this.jdbcClient = jdbcClient;
        this.passwordEncoder = passwordEncoder;
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findUsers() {
        return jdbcClient.sql("""
                        SELECT id, email, display_name, role, active, last_login_at, created_at
                        FROM administrator_users
                        ORDER BY created_at ASC, id ASC
                        """)
                .query(this::mapUser)
                .list();
    }

    @Transactional
    public UserResponse createUser(
            String rawEmail,
            String displayName,
            String password,
            AdministratorRole role,
            AdministratorPrincipal actor,
            String ipAddress) {
        String email = rawEmail.strip().toLowerCase(Locale.ROOT);
        UUID id = UUID.randomUUID();
        try {
            jdbcClient.sql("""
                            INSERT INTO administrator_users (
                                id, email, display_name, password_hash, password_scheme, role, active
                            ) VALUES (
                                :id, :email, :displayName, :passwordHash, 'ARGON2ID', :role, TRUE
                            )
                            """)
                    .param("id", id)
                    .param("email", email)
                    .param("displayName", displayName.strip())
                    .param("passwordHash", passwordEncoder.encode(password))
                    .param("role", role.name())
                    .update();
        } catch (DuplicateKeyException exception) {
            throw new AdministratorUserManagementException("An account with this email already exists");
        }
        auditEventRepository.record(
                actor.id(), "USER_CREATED", "ADMINISTRATOR_USER", id,
                Map.of("role", role.name()), ipAddress);
        return findUser(id);
    }

    @Transactional
    public UserResponse changeRole(
            UUID id,
            AdministratorRole role,
            AdministratorPrincipal actor,
            String ipAddress) {
        if (id.equals(actor.id())) {
            throw new AdministratorUserManagementException("Administrators cannot change their own role");
        }
        UserResponse user = findUser(id);
        int updated = jdbcClient.sql("""
                        UPDATE administrator_users
                        SET role = :role, updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id
                        """)
                .param("id", id)
                .param("role", role.name())
                .update();
        requireUpdated(updated);
        revokeSessions(user.email());
        auditEventRepository.record(
                actor.id(), "USER_ROLE_CHANGED", "ADMINISTRATOR_USER", id,
                Map.of("role", role.name()), ipAddress);
        return findUser(id);
    }

    @Transactional
    public UserResponse changeStatus(
            UUID id,
            boolean active,
            AdministratorPrincipal actor,
            String ipAddress) {
        if (id.equals(actor.id()) && !active) {
            throw new AdministratorUserManagementException("Administrators cannot deactivate their own account");
        }
        UserResponse user = findUser(id);
        int updated = jdbcClient.sql("""
                        UPDATE administrator_users
                        SET active = :active, updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id
                        """)
                .param("id", id)
                .param("active", active)
                .update();
        requireUpdated(updated);
        if (!active) revokeSessions(user.email());
        auditEventRepository.record(
                actor.id(), active ? "USER_ACTIVATED" : "USER_DEACTIVATED", "ADMINISTRATOR_USER", id,
                Map.of("active", active), ipAddress);
        return findUser(id);
    }

    private UserResponse findUser(UUID id) {
        return jdbcClient.sql("""
                        SELECT id, email, display_name, role, active, last_login_at, created_at
                        FROM administrator_users
                        WHERE id = :id
                        """)
                .param("id", id)
                .query(this::mapUser)
                .optional()
                .orElseThrow(() -> new AdministratorUserManagementException("Administrator account was not found"));
    }

    private void requireUpdated(int updated) {
        if (updated != 1) {
            throw new AdministratorUserManagementException("Administrator account was not found");
        }
    }

    private void revokeSessions(String email) {
        jdbcClient.sql("DELETE FROM spring_session WHERE principal_name = :email")
                .param("email", email)
                .update();
    }

    private UserResponse mapUser(ResultSet resultSet, int rowNumber) throws SQLException {
        return new UserResponse(
                resultSet.getObject("id", UUID.class),
                resultSet.getString("email"),
                resultSet.getString("display_name"),
                AdministratorRole.valueOf(resultSet.getString("role")),
                resultSet.getBoolean("active"),
                resultSet.getObject("last_login_at", OffsetDateTime.class),
                resultSet.getObject("created_at", OffsetDateTime.class));
    }

    public record UserResponse(
            UUID id,
            String email,
            String displayName,
            AdministratorRole role,
            boolean active,
            OffsetDateTime lastLoginAt,
            OffsetDateTime createdAt) {
    }
}
