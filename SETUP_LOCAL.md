# AyurPass Local Development Setup Guide

Secure default: **local web + local API + local database**.  
Real accounts stay on https://ayurpass.com only. See [docs/ENVIRONMENTS.md](./docs/ENVIRONMENTS.md).

## Prerequisites

- Node.js (v20 or higher)
- npm (v10.9.2 or higher)
- PostgreSQL with PostGIS extension (local install or Docker)
- Git
- Docker (recommended for database setup)

## Step-by-Step Setup

### 1. Clone and navigate

```bash
git clone <repository-url>
cd AyurPass
```

### 2. Database (PostgreSQL with PostGIS - Required)

**Docker (recommended):**

```bash
docker run --name ayurpass-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ayurpass_dev \
  -p 5432:5432 \
  -v ayurpass-db-data:/var/lib/postgresql/data \
  -d postgis/postgis:15-3.4
```

**Important:** Unlike many applications, AyurPass requires PostgreSQL with PostGIS extension for location-based services. Standard PostgreSQL will not work due to geospatial queries in the application.

### 3. Environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/dashboard/.env.example apps/dashboard/.env.local
# Optional for mobile: cp apps/mobile/.env.example apps/mobile/.env
```

Confirm dashboard points **only** at local API:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

API `.env` should include local `DATABASE_URL` and:

```
CORS_ORIGIN="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"
```

### 4. Install dependencies, generate Prisma client, and migrate database

```bash
npm install
npm run prisma:generate
npm run prisma:migrate dev
npm run seed:local
```

### 5. Start the application

```bash
npm start
```

- Web: http://localhost:3000  
- API: http://localhost:4000  

### Local demo logins

| Role | Email | Password |
|------|-------|----------|
| Seeker | `seeker@local.ayurpass.dev` | `LocalDev!23456` |
| Practice | `provider@local.ayurpass.dev` | `LocalDev!23456` |

`seed:local` refuses to run against RDS / production-looking databases.

## Additional Setup Notes

### Mobile Development

For mobile development:
```bash
cd apps/mobile
npm install
npm run ios  # or npm run android
```

Make sure your `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` points to your local API.

### Database Migration After Code Changes

After pulling code changes that include database schema modifications:
```bash
npm run prisma:generate
npm run prisma:migrate dev
```

### Running Individual Services

- API only: `npm run dev:api`
- Dashboard only: `npm run dev:dashboard`
- Mobile: `npm run dev:mobile`

## Production Login

Use https://ayurpass.com with your real email — not localhost.

## Troubleshooting

1. **Database Connection Issues**: Ensure you're using the PostGIS-enabled PostgreSQL instance, not standard PostgreSQL
2. **Prisma Errors**: Run `npm run prisma:generate` after pulling code changes
3. **Port Conflicts**: Verify ports 3000 and 4000 are available
4. **Environment Variables**: Double-check that both API and dashboard environments are properly configured
5. **Node Version**: Ensure you're using Node.js v20+ as older versions may cause compatibility issues