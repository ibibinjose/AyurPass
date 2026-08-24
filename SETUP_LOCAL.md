# AyurPass Local Development Setup Guide

The secure default is **local web + local API + local PostGIS database**. Real user accounts and production data must remain on [ayurpass.com](https://ayurpass.com). For environment policy, see [docs/ENVIRONMENTS.md](./docs/ENVIRONMENTS.md).

## Prerequisites

| Requirement | Recommended version or use |
|---|---|
| Node.js | 20 or higher |
| npm | 10.9.2 or higher |
| Docker Engine or Docker Desktop | Required for the bundled local PostGIS service |
| Docker Compose | Required by the one-command setup flow |
| Git | Required to clone and contribute changes |

AyurPass uses PostgreSQL with PostGIS for location-aware search. A standard PostgreSQL instance is not a substitute for the bundled development database.

## Quick start

Clone the repository, then run the setup command from the monorepo root. It installs locked dependencies, creates missing environment files, starts the local PostGIS database, generates Prisma Client, applies migrations, and loads deterministic demo data.

```bash
git clone <repository-url>
cd AyurPass
npm run setup:local
npm start
```

The application will be available at the following local URLs.

| Service | Local URL |
|---|---|
| Web dashboard | http://localhost:3000 |
| API | http://localhost:4000 |
| PostGIS database | localhost:5432 |

Use `npm run setup:local -- --skip-seed` if you require an empty migrated database. To rebuild the local database from scratch, run the following commands.

```bash
docker compose down -v
npm run setup:local
```

## Environment files

The setup command creates these files only when they are missing.

| File | Purpose |
|---|---|
| `apps/api/.env` | API database, CORS, mail, payment, and server-only integration settings |
| `apps/dashboard/.env.local` | Dashboard API base URL and optional public integration settings |
| `apps/mobile/.env` | Optional Expo/mobile settings; copy manually when working on mobile |

The bundled API environment matches the credentials used by `docker-compose.yml`.

```dotenv
DATABASE_URL="postgresql://ayurpass:ayurpass_dev_password@localhost:5432/ayurpass?schema=public"
CORS_ORIGIN="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"
PUBLIC_API_URL="http://localhost:4000"
```

Keep the dashboard connected only to the local API during daily work.

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Product analytics is deliberately disabled for local work. Enable it only in a configured deployment with a real Amplitude ingestion key.

```dotenv
NEXT_PUBLIC_ANALYTICS_ENABLED=false
# NEXT_PUBLIC_AMPLITUDE_API_KEY=YOUR_AMPLITUDE_INGESTION_KEY
```

## Local demo accounts

The default seed provides the following development accounts.

| Role | Email | Password |
|---|---|---|
| Seeker | `seeker@local.ayurpass.dev` | `LocalDev!23456` |
| Practice | `provider@local.ayurpass.dev` | `LocalDev!23456` |

The local seed script refuses to run against databases that look like production or RDS targets.

## Daily development commands

| Task | Command |
|---|---|
| Run API and dashboard | `npm start` |
| Run API only | `npm run dev:api` |
| Run dashboard only | `npm run dev:dashboard` |
| Run mobile client | `npm run dev:mobile` |
| Regenerate Prisma Client | `npm run prisma:generate` |
| Apply migrations | `npm run prisma:migrate` |
| Reload demo data | `npm run seed:local` |
| Run API smoke test | `npm run e2e:smoke` |

## Mobile development

Copy the mobile environment template before running Expo.

```bash
cp apps/mobile/.env.example apps/mobile/.env
npm run dev:mobile
```

On a physical device, `EXPO_PUBLIC_API_URL` must point to a LAN-accessible address for the development machine rather than `localhost`.

## Troubleshooting

| Symptom | Resolution |
|---|---|
| Docker Compose is unavailable | Install Docker Desktop or Docker Engine with the Compose plugin, then re-run `npm run setup:local`. |
| Prisma cannot connect | Confirm `docker compose ps` shows a healthy `ayurpass-db` service, then verify `apps/api/.env` uses the bundled database URL. |
| Dashboard says the wellness network is unreachable | Start the API with `npm run dev:api` or `npm start`, then open `http://localhost:4000/health`. |
| Browser console shows analytics errors | Keep `NEXT_PUBLIC_ANALYTICS_ENABLED=false` locally. Configure the key and flag only in the intended deployment environment. |
| Ports are occupied | Stop the process using ports 3000 or 4000, or change the corresponding port and CORS settings together. |

## Production

Use [https://ayurpass.com](https://ayurpass.com) for production accounts. Do not point a localhost dashboard at production APIs for normal development.
