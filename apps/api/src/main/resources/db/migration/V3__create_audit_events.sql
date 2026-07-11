CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES administrator_users(id) ON DELETE SET NULL,
    event_type VARCHAR(80) NOT NULL,
    resource_type VARCHAR(80) NOT NULL,
    resource_id UUID,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(64),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX audit_events_occurred_index ON audit_events (occurred_at DESC);
CREATE INDEX audit_events_actor_index ON audit_events (actor_id, occurred_at DESC);
CREATE INDEX audit_events_resource_index ON audit_events (resource_type, resource_id, occurred_at DESC);
