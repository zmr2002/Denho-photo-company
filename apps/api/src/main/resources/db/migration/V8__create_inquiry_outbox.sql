CREATE TYPE inquiry_outbox_status AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED');

CREATE TABLE inquiry_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL UNIQUE REFERENCES inquiries(id) ON DELETE CASCADE,
    status inquiry_outbox_status NOT NULL DEFAULT 'PENDING',
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    available_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_error VARCHAR(240),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX inquiry_outbox_delivery_index
    ON inquiry_outbox (status, available_at, created_at)
    WHERE status IN ('PENDING', 'FAILED');
