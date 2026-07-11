# Tianho Photo Company

Pre-launch multilingual website for 田豊株式会社. The project includes the public marketing site and a private content administration area.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma with SQLite for the temporary public-content compatibility layer
- Zod and React Hook Form
- Java 25 and Spring Boot 4.1
- Spring Security, server-side JDBC sessions, Spring Data JPA, Flyway, and PostgreSQL
- Argon2id passwords and TOTP account verification
- OpenAPI 3 and S3-compatible object storage support

## Languages and routes

The public site supports Japanese, Simplified Chinese, and English.

- `/ja/`, `/zh/`, `/en/`
- `/[locale]/services/`
- `/[locale]/works/`
- `/[locale]/articles/`
- `/[locale]/about/`
- `/[locale]/contact/`

The private administration area is available at `/studio-tianho/` and is not linked from the public navigation.

## Local setup

Requirements:

- Node.js 20 or later
- npm
- Java 25

Install dependencies:

```bash
npm install
```

Start PostgreSQL, local object storage, and the local mail viewer:

```bash
npm run services:up
```

The service configuration can be overridden with values from `infra/.env.example`.

Create `apps/web/.env` from `apps/web/.env.example`. `API_INTERNAL_URL` points server-rendered administration pages to the Spring API.

Prepare the temporary SQLite public-content database:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Start the API from `apps/api` before starting the web development server:

```bash
./gradlew bootRun
```

Start the web development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Create the API environment from `apps/api/.env.example`. A local administrator can be created once with the bootstrap variables. Every administrator and editor must bind a TOTP verifier before a session is established.

Set `CONTENT_BOOTSTRAP_ENABLED=true` for one start to verify and import the checked SQLite content export. The import is idempotent and stops if the SHA-256 checksum does not match.

The public API is available under `/api/v1/public`:

- `/articles` and `/articles/{slug}`
- `/works` and `/works/{slug}`
- `/notices/current`

Use the `locale` query parameter with `ja`, `zh`, or `en`. OpenAPI JSON is available at `/v3/api-docs`.

The checked API contract and matching TypeScript definitions must be refreshed together after changing API endpoints.

## Project structure

- `apps/web` contains the Next.js public site and administration pages.
- `apps/api` contains the Spring Boot HTTP API.
- Root npm commands run the corresponding web application command.

Run the API verification build from `apps/api`:

```bash
./gradlew build
```

## Verification

```bash
npm run lint
npm run build
```

## Project status

This repository is a pre-launch implementation. The current database, administrator account, sample content, image paths, and contact form behavior are intended for local verification and must be replaced or reviewed before production deployment.
