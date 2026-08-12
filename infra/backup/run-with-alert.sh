#!/bin/sh
set -eu

: "${1:?Pass a task name}"
task_name="$1"
shift

if "$@"; then
    exit 0
else
    exit_code=$?
fi

if [ -n "${BACKUP_ALERT_WEBHOOK:-}" ]; then
    payload="{\"event\":\"$task_name\",\"status\":\"failed\",\"occurredAt\":\"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\"}"
    curl --fail --silent --show-error --max-time 10 \
        --header 'Content-Type: application/json' \
        --data "$payload" \
        "$BACKUP_ALERT_WEBHOOK" >/dev/null || true
fi

printf '%s failed with exit code %s\n' "$task_name" "$exit_code" >&2
exit "$exit_code"
