CREATE TABLE inquiry_request_buckets (
    ip_hash CHAR(64) NOT NULL,
    bucket_start TIMESTAMPTZ NOT NULL,
    request_count INTEGER NOT NULL CHECK (request_count > 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ip_hash, bucket_start)
);

CREATE INDEX inquiry_request_buckets_cleanup_index ON inquiry_request_buckets (bucket_start);
