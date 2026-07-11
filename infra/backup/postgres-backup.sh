#!/bin/sh
set -eu

: "${BACKUP_DB_HOST:?BACKUP_DB_HOST is required}"
: "${BACKUP_DB_NAME:?BACKUP_DB_NAME is required}"
: "${DATABASE_USERNAME:?DATABASE_USERNAME is required}"
: "${DATABASE_PASSWORD:?DATABASE_PASSWORD is required}"
: "${BACKUP_AGE_RECIPIENT:?BACKUP_AGE_RECIPIENT is required}"
: "${BACKUP_BUCKET:?BACKUP_BUCKET is required}"
: "${BACKUP_ENDPOINT:?BACKUP_ENDPOINT is required}"

timestamp="$(date -u '+%Y%m%dT%H%M%SZ')"
work_directory="$(mktemp -d)"
dump_file="$work_directory/database.dump"
checksum_file="$work_directory/database.dump.sha256"
archive_file="$work_directory/postgres-$timestamp.tar.age"
object_key="postgres/weekly/$(basename "$archive_file")"

cleanup() {
    rm -rf "$work_directory"
}
trap cleanup EXIT INT TERM

export PGHOST="$BACKUP_DB_HOST"
export PGPORT="${BACKUP_DB_PORT:-5432}"
export PGDATABASE="$BACKUP_DB_NAME"
export PGUSER="$DATABASE_USERNAME"
export PGPASSWORD="$DATABASE_PASSWORD"
export PGSSLMODE="${BACKUP_DB_SSL_MODE:-require}"

pg_dump --format=custom --compress=zstd:9 --no-owner --no-acl --file="$dump_file"
pg_restore --list "$dump_file" >/dev/null
(
    cd "$work_directory"
    sha256sum database.dump > "$(basename "$checksum_file")"
    tar -cf - database.dump database.dump.sha256
) | age --recipient "$BACKUP_AGE_RECIPIENT" --output "$archive_file"

aws --endpoint-url "$BACKUP_ENDPOINT" s3 cp "$archive_file" "s3://$BACKUP_BUCKET/$object_key" --only-show-errors

cutoff="$(date -u -d '-56 days' '+%Y-%m-%dT%H:%M:%SZ')"
expired_keys="$(aws --endpoint-url "$BACKUP_ENDPOINT" s3api list-objects-v2 \
    --bucket "$BACKUP_BUCKET" \
    --prefix 'postgres/weekly/' \
    --query "Contents[?LastModified<=\`$cutoff\`].Key" \
    --output text)"
for key in $expired_keys; do
    aws --endpoint-url "$BACKUP_ENDPOINT" s3 rm "s3://$BACKUP_BUCKET/$key" --only-show-errors
done

printf 'Uploaded encrypted PostgreSQL backup: %s\n' "$object_key"
