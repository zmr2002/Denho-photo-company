CREATE TABLE content_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type VARCHAR(16) NOT NULL CHECK (resource_type IN ('ARTICLE', 'WORK', 'NOTICE')),
    resource_id UUID NOT NULL,
    version BIGINT NOT NULL,
    action VARCHAR(32) NOT NULL,
    snapshot JSONB NOT NULL,
    actor_id UUID REFERENCES administrator_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT content_revisions_resource_version_unique UNIQUE (resource_type, resource_id, version)
);

CREATE INDEX content_revisions_resource_index
    ON content_revisions (resource_type, resource_id, version DESC);

INSERT INTO content_revisions (resource_type, resource_id, version, action, snapshot)
SELECT 'ARTICLE', id, version, 'IMPORTED', to_jsonb(articles) FROM articles;

INSERT INTO content_revisions (resource_type, resource_id, version, action, snapshot)
SELECT 'WORK', id, version, 'IMPORTED', to_jsonb(works) FROM works;

INSERT INTO content_revisions (resource_type, resource_id, version, action, snapshot)
SELECT 'NOTICE', id, version, 'IMPORTED', to_jsonb(opening_notices) FROM opening_notices;

CREATE FUNCTION keep_content_revisions_immutable()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Content revisions are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_revisions_immutable
BEFORE UPDATE OR DELETE ON content_revisions
FOR EACH ROW EXECUTE FUNCTION keep_content_revisions_immutable();
