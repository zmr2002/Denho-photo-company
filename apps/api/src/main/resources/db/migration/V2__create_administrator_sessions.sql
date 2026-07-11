CREATE TABLE administrator_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) NOT NULL,
    display_name VARCHAR(160),
    password_hash VARCHAR(255) NOT NULL,
    password_scheme VARCHAR(16) NOT NULL DEFAULT 'ARGON2ID'
        CHECK (password_scheme IN ('BCRYPT', 'ARGON2ID')),
    role VARCHAR(16) NOT NULL DEFAULT 'ADMIN'
        CHECK (role IN ('ADMIN', 'EDITOR')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    verified_at TIMESTAMPTZ,
    failed_login_count INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT administrator_users_email_lowercase CHECK (email = lower(email)),
    CONSTRAINT administrator_users_email_unique UNIQUE (email)
);

CREATE TABLE administrator_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    administrator_id UUID REFERENCES administrator_users(id) ON DELETE SET NULL,
    email VARCHAR(320) NOT NULL,
    ip_address VARCHAR(64) NOT NULL,
    successful BOOLEAN NOT NULL,
    failure_reason VARCHAR(32),
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX administrator_login_attempts_account_index
    ON administrator_login_attempts (email, attempted_at DESC);

CREATE INDEX administrator_login_attempts_ip_index
    ON administrator_login_attempts (ip_address, attempted_at DESC);

CREATE TABLE spring_session (
    primary_id CHAR(36) NOT NULL,
    session_id CHAR(36) NOT NULL,
    creation_time BIGINT NOT NULL,
    last_access_time BIGINT NOT NULL,
    max_inactive_interval INTEGER NOT NULL,
    expiry_time BIGINT NOT NULL,
    principal_name VARCHAR(320),
    CONSTRAINT spring_session_pk PRIMARY KEY (primary_id)
);

CREATE UNIQUE INDEX spring_session_id_index ON spring_session (session_id);
CREATE INDEX spring_session_expiry_index ON spring_session (expiry_time);
CREATE INDEX spring_session_principal_index ON spring_session (principal_name);

CREATE TABLE spring_session_attributes (
    session_primary_id CHAR(36) NOT NULL,
    attribute_name VARCHAR(200) NOT NULL,
    attribute_bytes BYTEA NOT NULL,
    CONSTRAINT spring_session_attributes_pk PRIMARY KEY (session_primary_id, attribute_name),
    CONSTRAINT spring_session_attributes_session_fk
        FOREIGN KEY (session_primary_id) REFERENCES spring_session(primary_id) ON DELETE CASCADE
);
