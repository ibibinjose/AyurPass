# AyurPass Local Development Setup Guide

Secure default: **local web + local API + local database**.  
Real accounts stay on https://ayurpass.com only. See [docs/ENVIRONMENTS.md](./docs/ENVIRONMENTS.md).

## Prerequisites

- Node.js (v18 or higher)
- npm
- PostgreSQL (local install or Docker)
- Git

## Step-by-Step Setup

### 1. Clone and navigate

```bash
cd AyurPass
```

### 2. Database

**Docker (recommended):**

```bash
docker run --name ayurpass-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ayurpass_dev \
  -p 5432:5432 -d postgres:15
```

Or create `ayurpass_dev` on a local Postgres install.

### 3. Environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/dashboard/.env.example apps/dashboard/.env.local
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

### 4. Install, migrate, seed

```bash
npm install
npm run prisma:generate
cd apps/api && npx prisma migrate deploy && cd ../..
npm run seed:local
```

### 5. Start

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

## Production login

Use https://ayurpass.com with your real email — not localhost.
