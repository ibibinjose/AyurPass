# Running AyurPass Application

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
npm start
```

This starts the API (http://localhost:4000) and the dashboard (http://localhost:3000). `Ctrl+C` stops both.

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

## Turbo

```bash
npx turbo run typecheck
npx turbo run build --filter=@ayurpass/dashboard
```
