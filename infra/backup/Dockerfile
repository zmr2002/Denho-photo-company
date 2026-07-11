FROM postgres:17.5-alpine
RUN apk add --no-cache age aws-cli ca-certificates coreutils tzdata
COPY postgres-backup.sh /usr/local/bin/postgres-backup
COPY verify-postgres-restore.sh /usr/local/bin/verify-postgres-restore
RUN chmod 0755 /usr/local/bin/postgres-backup /usr/local/bin/verify-postgres-restore \
    && echo '15 2 * * 0 /usr/local/bin/postgres-backup' > /etc/crontabs/root
CMD ["crond", "-f", "-l", "2"]
