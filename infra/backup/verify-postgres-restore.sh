#!/bin/sh
set -eu

: "${1:?Pass the backup object key as the first argument}"
: "${BACKUP_BUCKET:?BACKUP_BUCKET is required}"
: "${BACKUP_ENDPOINT:?BACKUP_ENDPOINT is required}"
: "${BACKUP_AGE_IDENTITY_FILE:?BACKUP_AGE_IDENTITY_FILE is required}"
: "${RESTORE_DB_HOST:?RESTORE_DB_HOST is required}"
: "${RESTORE_DB_ADMIN_USERNAME:?RESTORE_DB_ADMIN_USERNAME is required}"
: "${RESTORE_DB_ADMIN_PASSWORD:?RESTORE_DB_ADMIN_PASSWORD is required}"

object_key="$1"
timestamp="$(date -u '+%Y%m%d%H%M%S')"
database_name="restore_check_${timestamp}_$$"
work_directory="$(mktemp -d)"
archive_file="$work_directory/backup.tar.age"

cleanup() {
    PGPASSWORD="$RESTORE_DB_ADMIN_PASSWORD" dropdb \
        --host="$RESTORE_DB_HOST" \
        --port="${RESTORE_DB_PORT:-5432}" \
        --username="$RESTORE_DB_ADMIN_USERNAME" \
        --if-exists "$database_name" >/dev/null 2>&1 || true
    rm -rf "$work_directory"
}
trap cleanup EXIT INT TERM

aws --endpoint-url "$BACKUP_ENDPOINT" s3 cp "s3://$BACKUP_BUCKET/$object_key" "$archive_file" --only-show-errors
age --decrypt --identity "$BACKUP_AGE_IDENTITY_FILE" "$archive_file" | tar -xf - -C "$work_directory"
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
