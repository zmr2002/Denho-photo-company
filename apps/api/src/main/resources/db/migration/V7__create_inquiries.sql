CREATE TYPE inquiry_status AS ENUM ('NEW', 'IN_PROGRESS', 'CLOSED', 'SPAM', 'ANONYMIZED');

CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key UUID NOT NULL UNIQUE,
    name_company VARCHAR(240) NOT NULL,
    email VARCHAR(320) NOT NULL,
    project_type VARCHAR(160) NOT NULL,
    requested_date VARCHAR(120),
    location VARCHAR(240),
    message TEXT NOT NULL,
    locale VARCHAR(5) NOT NULL CHECK (locale IN ('ja', 'zh', 'en')),
    status inquiry_status NOT NULL DEFAULT 'NEW',
    consent_version VARCHAR(40) NOT NULL,
    consented_at TIMESTAMPTZ NOT NULL,
    ip_hash CHAR(64),
    anonymized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX inquiries_status_created_index ON inquiries (status, created_at DESC);
CREATE INDEX inquiries_created_index ON inquiries (created_at);
