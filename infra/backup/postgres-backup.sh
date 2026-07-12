#!/bin/sh
set -eu

: "${BACKUP_DB_HOST:?BACKUP_DB_HOST is required}"
: "${BACKUP_DB_NAME:?BACKUP_DB_NAME is required}"
: "${DATABASE_USERNAME:?DATABASE_USERNAME is required}"
: "${DATABASE_PASSWORD:?DATABASE_PASSWORD is required}"
: "${BACKUP_ENCRYPTION_PASSWORD:?BACKUP_ENCRYPTION_PASSWORD is required}"
: "${BACKUP_AUTHENTICATION_KEY:?BACKUP_AUTHENTICATION_KEY is required}"
: "${BACKUP_BUCKET:?BACKUP_BUCKET is required}"
: "${BACKUP_ENDPOINT:?BACKUP_ENDPOINT is required}"

timestamp="$(date -u '+%Y%m%dT%H%M%SZ')"
work_directory="$(mktemp -d)"
dump_file="$work_directory/database.dump"
checksum_file="$work_directory/database.dump.sha256"
plain_archive="$work_directory/postgres-$timestamp.tar"
archive_file="$plain_archive.enc"
authentication_file="$archive_file.sha256"
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
    tar -cf "$plain_archive" database.dump database.dump.sha256
)

openssl enc -aes-256-cbc -salt -pbkdf2 -iter 600000 \
    -pass env:BACKUP_ENCRYPTION_PASSWORD \
    -in "$plain_archive" \
    -out "$archive_file"
openssl dgst -sha256 -hmac "$BACKUP_AUTHENTICATION_KEY" -binary "$archive_file" \
    | openssl base64 -A > "$authentication_file"
rm -f "$plain_archive"

s3-backup-client put "$object_key" "$archive_file"
s3-backup-client put "$object_key.sha256" "$authentication_file"

s3-backup-client delete-expired 'postgres/weekly/' 56

printf 'Uploaded encrypted PostgreSQL backup: %s\n' "$object_key"
