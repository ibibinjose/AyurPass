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

From the project root, with PostgreSQL running:

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

## Turbo

```bash
npx turbo run typecheck
npx turbo run build --filter=@ayurpass/dashboard
```
