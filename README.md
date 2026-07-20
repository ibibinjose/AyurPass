# AyurPass — Find & book Ayurveda, Yoga & Wellness

Premium wellness marketplace for **Ayurveda, yoga, luxury spa, meditation, health clubs and retreats** — a dual-sided platform for consumers and practitioners.

## Stack

| Layer | Tech |
|---|---|
| API | NestJS 11 · Prisma 6 · PostgreSQL · Stripe Connect · JWT auth |
| Web | Next.js 16 · React 19 · Tailwind CSS v4 |
| Mobile | Expo 55 · React Native 0.83 · React 19 |
| Shared | `@ayurpass/shared` types |

## Features

- Directory: practices, practitioners, services, products, retreats, offers  
- Booking + payments (mock in local dev; Stripe when configured)  
- Dosha assessment & health profiles (consent-gated)  
- Loyalty rewards & gift cards  
- Provider dashboard (calendar, enquiries, Stripe onboarding)  
- Consumer privacy & permissions  
- Mobile consumer app  

## Quick start

```bash
# Prerequisites: Node 20+, PostgreSQL
cp backend/.env.example backend/.env   # edit DATABASE_URL, JWT secrets
cp frontend/.env.example frontend/.env.local  # NEXT_PUBLIC_API_URL

npm run install:all
npm run prisma:generate
npm run prisma:migrate
npm start   # API :4000 + web :3000
```

| Script | Purpose |
|---|---|
| `npm start` | Backend + frontend together |
| `npm run dev:backend` | Nest watch mode |
| `npm run dev:frontend` | Next.js dev |
| `npm run dev:mobile` | Expo |
| `npm run stripe:status` | Stripe key / mock mode check |

See [SETUP_LOCAL.md](./SETUP_LOCAL.md), [RUN_APP.md](./RUN_APP.md), **[docs/AWS-AMPLIFY-HOSTING.md](./docs/AWS-AMPLIFY-HOSTING.md)** (Amplify + App Runner hosting playbook), and **[docs/AWS-AND-MOBILE-LAUNCH.md](./docs/AWS-AND-MOBILE-LAUNCH.md)** (AWS hosting + Expo 55 store path).

## Security notes (production)

Set **real** `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`, an explicit `CORS_ORIGIN` allowlist, and Stripe keys.  
With `NODE_ENV=production` (or `AYURPASS_STRICT=1`), the API refuses default secrets, open CORS, and mock card payments.

Money routes require the **booking/order owner** to checkout; parties may refund. Auth endpoints are rate-limited.

## Documentation

| Doc | Contents |
|---|---|
| [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) | Roadmap & status |
| [docs/BUILD-LOG.md](./docs/BUILD-LOG.md) | Changelog |
| [docs/PRD.md](./docs/PRD.md) | Product requirements |
| [docs/08-API-CONTRACTS.md](./docs/08-API-CONTRACTS.md) | API contracts |
| [docs/APP_FLOW.md](./docs/APP_FLOW.md) | User flows |

## Project layout

```
AyurPass/
├── backend/          # NestJS API
├── frontend/         # Next.js web
├── mobile/           # Expo app
├── shared/           # Shared TypeScript types
├── docs/             # Product & technical docs
└── package.json      # Workspace scripts
```

## License

Private — all rights reserved.
