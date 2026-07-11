ALTER TABLE administrator_users
    ADD COLUMN mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN mfa_secret_ciphertext BYTEA,
    ADD COLUMN mfa_secret_iv BYTEA;

CREATE TABLE administrator_mfa_challenges (
    id UUID PRIMARY KEY,
    administrator_id UUID NOT NULL REFERENCES administrator_users(id) ON DELETE CASCADE,
    purpose VARCHAR(16) NOT NULL CHECK (purpose IN ('SETUP', 'VERIFY')),
    pending_secret_ciphertext BYTEA,
    pending_secret_iv BYTEA,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX administrator_mfa_challenges_user_index
    ON administrator_mfa_challenges (administrator_id, created_at DESC);

CREATE INDEX administrator_mfa_challenges_expiry_index
    ON administrator_mfa_challenges (expires_at);

CREATE TABLE administrator_recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    administrator_id UUID NOT NULL REFERENCES administrator_users(id) ON DELETE CASCADE,
    code_hash CHAR(64) NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT administrator_recovery_codes_hash_unique UNIQUE (administrator_id, code_hash)
);

CREATE INDEX administrator_recovery_codes_available_index
    ON administrator_recovery_codes (administrator_id, used_at);
