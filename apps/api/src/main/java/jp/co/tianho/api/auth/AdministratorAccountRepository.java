package jp.co.tianho.api.auth;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
class AdministratorAccountRepository {

    private final JdbcClient jdbcClient;

    AdministratorAccountRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    Optional<AdministratorAccount> findByEmail(String email) {
        return jdbcClient.sql("""
                        SELECT id, email, display_name, password_hash, password_scheme, role, active,
                               verified_at, failed_login_count, locked_until
                        FROM administrator_users
                        WHERE email = :email
                        """)
                .param("email", email)
                .query(this::mapAccount)
                .optional();
    }

    void resetExpiredLock(String email) {
        jdbcClient.sql("""
                        UPDATE administrator_users
                        SET failed_login_count = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP
                        WHERE email = :email AND locked_until <= CURRENT_TIMESTAMP
                        """)
                .param("email", email)
                .update();
    }

    void recordFailedLogin(UUID id) {
        jdbcClient.sql("""
                        UPDATE administrator_users
                        SET failed_login_count = failed_login_count + 1,
                            locked_until = CASE
                                WHEN failed_login_count + 1 >= 5
                                    THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
                                ELSE locked_until
                            END,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id
                        """)
                .param("id", id)
                .update();
    }

    void recordSuccessfulLogin(UUID id) {
        jdbcClient.sql("""
                        UPDATE administrator_users
                        SET failed_login_count = 0,
                            locked_until = NULL,
                            last_login_at = CURRENT_TIMESTAMP,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id
                        """)
                .param("id", id)
                .update();
    }

    void upgradePassword(UUID id, String passwordHash) {
        jdbcClient.sql("""
                        UPDATE administrator_users
                        SET password_hash = :passwordHash,
                            password_scheme = 'ARGON2ID',
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id
                        """)
                .param("id", id)
                .param("passwordHash", passwordHash)
                .update();
    }

    void recordAttempt(UUID administratorId, String email, String ipAddress, boolean successful, String reason) {
        jdbcClient.sql("""
                        INSERT INTO administrator_login_attempts (
                            administrator_id, email, ip_address, successful, failure_reason
                        ) VALUES (:administratorId, :email, :ipAddress, :successful, :reason)
                        """)
                .param("administratorId", administratorId, Types.OTHER)
                .param("email", email)
                .param("ipAddress", ipAddress)
                .param("successful", successful)
                .param("reason", reason, Types.VARCHAR)
                .update();
    }

    long countAttemptsByAddressSince(String ipAddress, OffsetDateTime since) {
        return jdbcClient.sql("""
                        SELECT count(*)
                        FROM administrator_login_attempts
                        WHERE ip_address = :ipAddress
                          AND successful = FALSE
                          AND attempted_at >= :since
                        """)
                .param("ipAddress", ipAddress)
                .param("since", since)
                .query(Long.class)
                .single();
    }

    void createBootstrapAdministrator(String email, String displayName, String passwordHash) {
        jdbcClient.sql("""
                        INSERT INTO administrator_users (
                            email, display_name, password_hash, password_scheme, role, active, verified_at
                        ) VALUES (
                            :email, :displayName, :passwordHash, 'ARGON2ID', 'ADMIN', TRUE, CURRENT_TIMESTAMP
                        )
                        ON CONFLICT (email) DO NOTHING
                        """)
                .param("email", email)
                .param("displayName", displayName)
                .param("passwordHash", passwordHash)
                .update();
    }

    private AdministratorAccount mapAccount(ResultSet resultSet, int rowNumber) throws SQLException {
        return new AdministratorAccount(
                resultSet.getObject("id", UUID.class),
                resultSet.getString("email"),
                resultSet.getString("display_name"),
                resultSet.getString("password_hash"),
                resultSet.getString("password_scheme"),
                resultSet.getString("role"),
                resultSet.getBoolean("active"),
                resultSet.getObject("verified_at", OffsetDateTime.class),
                resultSet.getInt("failed_login_count"),
                resultSet.getObject("locked_until", OffsetDateTime.class));
    }
}
