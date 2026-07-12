FROM golang:1.26.4-alpine3.23 AS build

ARG CADDY_VERSION=v2.11.4
RUN apk add --no-cache ca-certificates git \
    && CGO_ENABLED=0 go install github.com/caddyserver/caddy/v2/cmd/caddy@${CADDY_VERSION} \
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
