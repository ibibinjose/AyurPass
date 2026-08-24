# Running AyurPass Application

## Environments (secure default)

| | Local | Production |
|--|--------|------------|
| Web | http://localhost:3000 | https://ayurpass.com |
| API | http://localhost:4000 | https://api.ayurpass.com |
| Login | Seeded demo users | Your real account |

**Do not point localhost at the production API for daily work.**  
Full policy: [docs/ENVIRONMENTS.md](./docs/ENVIRONMENTS.md).

## Monorepo layout

```text
apps/api         NestJS API (:4000)
apps/dashboard   Next.js web + admin dashboard (:3000)
apps/mobile      Expo iOS / Android
packages/shared  Shared types, tokens, API contracts
```

## Quick Start (recommended)

From the project root, with PostgreSQL + PostGIS running:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/dashboard/.env.example apps/dashboard/.env.local
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed:local    # demo seeker + practice owner (local DB only)
npm start
```

This starts the API (http://localhost:4000) and the dashboard (http://localhost:3000). `Ctrl+C` stops both.

### Local demo logins

| Role | Email | Password |
|------|-------|----------|
| Seeker | `seeker@local.ayurpass.dev` | `LocalDev!23456` |
| Practice | `provider@local.ayurpass.dev` | `LocalDev!23456` |

Use your **real** email only on https://ayurpass.com.

## Run individually

```bash
npm run dev:api        # Nest watch → :4000
npm run dev:dashboard  # Next.js → :3000
npm run dev:mobile     # Expo Metro
```

## Mobile

```bash
cd apps/mobile
# or from root:
npm run dev:mobile
```

Set `EXPO_PUBLIC_API_URL` (see `apps/mobile/.env.example`) for physical devices / EAS builds.  
Local device: point at your LAN IP API, not production, unless using a dedicated staging stack.

## Database Setup

**Important:** PostgreSQL must have PostGIS extension installed. Use the PostGIS-enabled Docker image:

```bash
docker compose up -d db
```

This starts PostGIS as `ayurpass-db` on **localhost:5433** (host 5433 maps to container 5432 so it does not clash with a local Homebrew Postgres).

After setting up the database, run:
```bash
npm run prisma:generate
npm run prisma:migrate
```

## Seeding Data

To populate your local database with sample data:
```bash
npm run seed:local
```

This will create demo users, providers, services, and other sample data for testing.

## Turbo

```bash
npx turbo run typecheck
npx turbo run build --filter=@ayurpass/dashboard
```

## API Endpoints

Common API endpoints:
- `GET /health` - Health check
- `GET /health/ready` - Database readiness check
- `POST /auth/login` - Authentication
- `GET /providers` - List providers
- `GET /services` - List services
- `GET /discover` - Discover services and providers

## Troubleshooting

- If you encounter database errors, ensure you're using the PostGIS-enabled PostgreSQL instance
- Make sure environment variables are properly configured for both API and dashboard
- Check that ports 3000 and 4000 are available
- Run `npm run prisma:generate` after pulling code changes that affect the database schema