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
class MfaChallengeRepository {

    private final JdbcClient jdbcClient;

    MfaChallengeRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    void create(
            UUID id,
            UUID administratorId,
            String purpose,
            byte[] pendingCiphertext,
            byte[] pendingIv,
            OffsetDateTime expiresAt) {
        jdbcClient.sql("""
                        INSERT INTO administrator_mfa_challenges (
                            id, administrator_id, purpose, pending_secret_ciphertext,
                            pending_secret_iv, expires_at
                        ) VALUES (
                            :id, :administratorId, :purpose, :pendingCiphertext, :pendingIv, :expiresAt
                        )
                        """)
                .param("id", id)
                .param("administratorId", administratorId)
                .param("purpose", purpose)
                .param("pendingCiphertext", pendingCiphertext, Types.BINARY)
                .param("pendingIv", pendingIv, Types.BINARY)
                .param("expiresAt", expiresAt)
                .update();
    }

    Optional<MfaChallenge> findActive(UUID id) {
        return jdbcClient.sql("""
                        SELECT challenge.id, challenge.administrator_id, challenge.purpose,
                               challenge.pending_secret_ciphertext, challenge.pending_secret_iv,
                               user_account.email, user_account.display_name, user_account.role,
                               user_account.mfa_enabled, user_account.mfa_secret_ciphertext,
                               user_account.mfa_secret_iv
                        FROM administrator_mfa_challenges challenge
                        JOIN administrator_users user_account ON user_account.id = challenge.administrator_id
                        WHERE challenge.id = :id
                          AND challenge.completed_at IS NULL
                          AND challenge.expires_at > CURRENT_TIMESTAMP
                          AND challenge.failed_attempts < 5
                          AND user_account.active = TRUE
                        """)
                .param("id", id)
                .query(this::mapChallenge)
                .optional();
    }

    void recordFailure(UUID id) {
        jdbcClient.sql("""
                        UPDATE administrator_mfa_challenges
                        SET failed_attempts = failed_attempts + 1
                        WHERE id = :id AND completed_at IS NULL
                        """)
                .param("id", id)
                .update();
    }

    void complete(UUID id) {
        jdbcClient.sql("""
                        UPDATE administrator_mfa_challenges
                        SET completed_at = CURRENT_TIMESTAMP
                        WHERE id = :id AND completed_at IS NULL
                        """)
                .param("id", id)
                .update();
    }

    void enableMfa(UUID administratorId, byte[] ciphertext, byte[] iv) {
        jdbcClient.sql("""
                        UPDATE administrator_users
                        SET mfa_enabled = TRUE,
                            mfa_secret_ciphertext = :ciphertext,
                            mfa_secret_iv = :iv,
                            verified_at = CURRENT_TIMESTAMP,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = :administratorId
                        """)
                .param("administratorId", administratorId)
                .param("ciphertext", ciphertext)
                .param("iv", iv)
                .update();
    }

    void replaceRecoveryCodes(UUID administratorId, Iterable<String> hashes) {
        jdbcClient.sql("DELETE FROM administrator_recovery_codes WHERE administrator_id = :administratorId")
                .param("administratorId", administratorId)
                .update();
        for (String hash : hashes) {
            jdbcClient.sql("""
                            INSERT INTO administrator_recovery_codes (administrator_id, code_hash)
                            VALUES (:administratorId, :codeHash)
                            """)
                    .param("administratorId", administratorId)
                    .param("codeHash", hash)
                    .update();
        }
    }

    boolean consumeRecoveryCode(UUID administratorId, String codeHash) {
        return jdbcClient.sql("""
                        UPDATE administrator_recovery_codes
                        SET used_at = CURRENT_TIMESTAMP
                        WHERE administrator_id = :administratorId
                          AND code_hash = :codeHash
                          AND used_at IS NULL
                        """)
                .param("administratorId", administratorId)
                .param("codeHash", codeHash)
                .update() == 1;
    }

    private MfaChallenge mapChallenge(ResultSet resultSet, int rowNumber) throws SQLException {
        return new MfaChallenge(
                resultSet.getObject("id", UUID.class),
                resultSet.getObject("administrator_id", UUID.class),
                resultSet.getString("purpose"),
                resultSet.getBytes("pending_secret_ciphertext"),
                resultSet.getBytes("pending_secret_iv"),
                resultSet.getString("email"),
                resultSet.getString("display_name"),
                resultSet.getString("role"),
                resultSet.getBoolean("mfa_enabled"),
                resultSet.getBytes("mfa_secret_ciphertext"),
                resultSet.getBytes("mfa_secret_iv"));
    }

    record MfaChallenge(
            UUID id,
            UUID administratorId,
            String purpose,
            byte[] pendingCiphertext,
            byte[] pendingIv,
            String email,
            String displayName,
            String role,
            boolean mfaEnabled,
            byte[] secretCiphertext,
            byte[] secretIv) {

        AdministratorPrincipal principal() {
            return new AdministratorPrincipal(administratorId, email, displayName, role);
        }
    }
}
