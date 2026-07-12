FROM golang:1.26.5-alpine3.23 AS build
WORKDIR /src
COPY s3_backup_client.go .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/s3-backup-client s3_backup_client.go

FROM alpine:3.23
RUN apk upgrade --no-cache && apk add --no-cache openssl postgresql17-client tzdata
COPY postgres-backup.sh /usr/local/bin/postgres-backup
COPY verify-postgres-restore.sh /usr/local/bin/verify-postgres-restore
COPY --from=build /out/s3-backup-client /usr/local/bin/s3-backup-client
RUN sed -i 's/\r$//' /usr/local/bin/postgres-backup /usr/local/bin/verify-postgres-restore \
    && chmod 0755 /usr/local/bin/postgres-backup /usr/local/bin/verify-postgres-restore /usr/local/bin/s3-backup-client \
    && echo '15 2 * * 0 /usr/local/bin/postgres-backup' > /etc/crontabs/root
CMD ["crond", "-f", "-l", "2"]
