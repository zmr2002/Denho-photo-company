FROM golang:1.26.5-alpine3.23 AS build

ARG CADDY_VERSION=v2.11.4
ARG X_TEXT_VERSION=v0.39.0
ARG GRPC_VERSION=v1.82.1
RUN apk add --no-cache ca-certificates git \
    && git clone --depth 1 --branch ${CADDY_VERSION} https://github.com/caddyserver/caddy.git /src/caddy \
    && cd /src/caddy \
    && go get golang.org/x/text@${X_TEXT_VERSION} google.golang.org/grpc@${GRPC_VERSION} \
    && CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /go/bin/caddy ./cmd/caddy \
    && go version -m /go/bin/caddy | grep -E "golang.org/x/text[[:space:]]+${X_TEXT_VERSION}" \
    && go version -m /go/bin/caddy | grep -E "google.golang.org/grpc[[:space:]]+${GRPC_VERSION}" \
    && mkdir -p /rootfs/etc/caddy /rootfs/data /rootfs/config \
    && chown -R 1000:1000 /rootfs/data /rootfs/config

FROM scratch
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /go/bin/caddy /usr/bin/caddy
COPY --from=build --chown=1000:1000 /rootfs/data /data
COPY --from=build --chown=1000:1000 /rootfs/config /config
COPY --from=build /rootfs/etc/caddy /etc/caddy

ENV XDG_CONFIG_HOME=/config
ENV XDG_DATA_HOME=/data
USER 1000:1000
EXPOSE 80 443 443/udp
ENTRYPOINT ["/usr/bin/caddy"]
CMD ["run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
