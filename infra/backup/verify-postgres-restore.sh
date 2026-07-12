#!/bin/sh
set -eu

: "${1:?Pass the backup object key as the first argument}"
: "${BACKUP_BUCKET:?BACKUP_BUCKET is required}"
: "${BACKUP_ENDPOINT:?BACKUP_ENDPOINT is required}"
: "${BACKUP_ENCRYPTION_PASSWORD:?BACKUP_ENCRYPTION_PASSWORD is required}"
: "${BACKUP_AUTHENTICATION_KEY:?BACKUP_AUTHENTICATION_KEY is required}"
: "${RESTORE_DB_HOST:?RESTORE_DB_HOST is required}"
: "${RESTORE_DB_ADMIN_USERNAME:?RESTORE_DB_ADMIN_USERNAME is required}"
: "${RESTORE_DB_ADMIN_PASSWORD:?RESTORE_DB_ADMIN_PASSWORD is required}"

object_key="$1"
timestamp="$(date -u '+%Y%m%d%H%M%S')"
database_name="restore_check_${timestamp}_$$"
work_directory="$(mktemp -d)"
archive_file="$work_directory/backup.tar.enc"
authentication_file="$archive_file.sha256"
plain_archive="$work_directory/backup.tar"

cleanup() {
    PGPASSWORD="$RESTORE_DB_ADMIN_PASSWORD" dropdb \
        --host="$RESTORE_DB_HOST" \
        --port="${RESTORE_DB_PORT:-5432}" \
        --username="$RESTORE_DB_ADMIN_USERNAME" \
        --if-exists "$database_name" >/dev/null 2>&1 || true
    rm -rf "$work_directory"
}
trap cleanup EXIT INT TERM

s3-backup-client get "$object_key" "$archive_file"
s3-backup-client get "$object_key.sha256" "$authentication_file"
actual_authentication="$(openssl dgst -sha256 -hmac "$BACKUP_AUTHENTICATION_KEY" -binary "$archive_file" | openssl base64 -A)"
expected_authentication="$(cat "$authentication_file")"
if [ "$actual_authentication" != "$expected_authentication" ]; then
    printf 'Backup authentication failed\n' >&2
    exit 1
fi
openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 \
    -pass env:BACKUP_ENCRYPTION_PASSWORD \
    -in "$archive_file" \
    -out "$plain_archive"
tar -xf "$plain_archive" -C "$work_directory"
(
    cd "$work_directory"
    sha256sum -c database.dump.sha256
)

export PGHOST="$RESTORE_DB_HOST"
export PGPORT="${RESTORE_DB_PORT:-5432}"
export PGUSER="$RESTORE_DB_ADMIN_USERNAME"
export PGPASSWORD="$RESTORE_DB_ADMIN_PASSWORD"
export PGSSLMODE="${RESTORE_DB_SSL_MODE:-require}"

createdb "$database_name"
pg_restore --dbname="$database_name" --no-owner --no-acl --exit-on-error "$work_directory/database.dump"
psql --dbname="$database_name" --no-psqlrc --tuples-only --command="SELECT count(*) FROM flyway_schema_history" >/dev/null

printf 'PostgreSQL restore verification passed: %s\n' "$object_key"
