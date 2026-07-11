CREATE TYPE media_asset_status AS ENUM ('ACTIVE', 'TRASHED', 'DELETED');

CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_key VARCHAR(240) NOT NULL UNIQUE,
    thumbnail_key VARCHAR(240) NOT NULL UNIQUE,
    original_filename VARCHAR(240) NOT NULL,
    content_type VARCHAR(32) NOT NULL CHECK (content_type IN ('image/jpeg', 'image/png')),
    byte_size BIGINT NOT NULL CHECK (byte_size > 0),
    width INTEGER NOT NULL CHECK (width > 0),
    height INTEGER NOT NULL CHECK (height > 0),
    sha256 CHAR(64) NOT NULL UNIQUE,
    status media_asset_status NOT NULL DEFAULT 'ACTIVE',
    created_by UUID REFERENCES administrator_users(id) ON DELETE SET NULL,
    trashed_at TIMESTAMPTZ,
    purge_after TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT media_assets_trash_dates_consistent CHECK (
        (status = 'TRASHED' AND trashed_at IS NOT NULL AND purge_after IS NOT NULL)
        OR (status <> 'TRASHED' AND trashed_at IS NULL AND purge_after IS NULL)
    )
);

CREATE INDEX media_assets_status_created_index
    ON media_assets (status, created_at DESC);

CREATE TABLE media_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
    resource_type VARCHAR(32) NOT NULL,
    resource_id UUID NOT NULL,
    field_name VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT media_references_target_unique UNIQUE (asset_id, resource_type, resource_id, field_name)
);

CREATE INDEX media_references_asset_index ON media_references (asset_id);

CREATE TABLE media_cleanup_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL,
    object_key VARCHAR(240) NOT NULL,
    thumbnail_key VARCHAR(240) NOT NULL,
    result VARCHAR(32) NOT NULL,
    details TEXT,
    cleaned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
