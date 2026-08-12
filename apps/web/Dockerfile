FROM node:24.13.1-alpine AS dependencies
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
RUN npm ci --ignore-scripts

FROM node:24.13.1-alpine AS build
WORKDIR /workspace
ENV NEXT_TELEMETRY_DISABLED=1
ENV CONTENT_PROVIDER=mock
# Next.js records rewrite destinations during the image build. Server-side
# content requests still use the runtime value supplied by Docker Compose.
ARG API_INTERNAL_URL=http://api:8080
ENV API_INTERNAL_URL=${API_INTERNAL_URL}
COPY --from=dependencies /workspace/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY apps/web ./apps/web
RUN npm run build --workspace @tianho/web

FROM node:24.13.1-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN apk upgrade --no-cache && npm uninstall --global npm \
    && addgroup --system --gid 10001 web && adduser --system --uid 10001 --ingroup web web
COPY --from=build --chown=web:web /workspace/apps/web/.next/standalone ./
COPY --from=build --chown=web:web /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=web:web /workspace/apps/web/public ./apps/web/public
USER web
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
