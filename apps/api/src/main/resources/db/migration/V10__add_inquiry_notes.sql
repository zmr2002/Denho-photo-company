CREATE TABLE inquiry_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES administrator_users(id) ON DELETE SET NULL,
    body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX inquiry_notes_inquiry_created_index
    ON inquiry_notes (inquiry_id, created_at DESC, id DESC);
