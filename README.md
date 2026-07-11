# Tianho Photo Company

Pre-launch multilingual website for 田豊株式会社. The project includes the public marketing site and a private content administration area.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma with SQLite for local development
- NextAuth credentials sessions
- Zod and React Hook Form

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

Install dependencies:

```bash
npm install
```

Create `apps/web/.env` from `apps/web/.env.example`, then replace the example secret and administrator password.

Prepare the local database:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Project structure

- `apps/web` contains the Next.js public site and administration pages.
- Root npm commands run the corresponding web application command.

## Verification

```bash
npm run lint
npm run build
```

## Project status

This repository is a pre-launch implementation. The current database, administrator account, sample content, image paths, and contact form behavior are intended for local verification and must be replaced or reviewed before production deployment.
