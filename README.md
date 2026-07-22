# AyurPass — Find & book Ayurveda, Yoga & Wellness

Premium wellness marketplace for **Ayurveda, yoga, luxury spa, meditation, health clubs and retreats** — a dual-sided platform for consumers and practitioners.

[![CI](https://github.com/ibibinjose/AyurPass/actions/workflows/ci.yml/badge.svg)](https://github.com/ibibinjose/AyurPass/actions/workflows/ci.yml)
[![Deploy Backend](https://github.com/ibibinjose/AyurPass/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/ibibinjose/AyurPass/actions/workflows/deploy-backend.yml)

## Live Production Environments

| Layer | Environment | Live URL | Status |
|---|---|---|---|
| **Web Frontend** | AWS Amplify (CloudFront CDN) | [https://ayurpass.com](https://ayurpass.com) | 🟢 Live (HTTP/2, SSL) |
| **Backend API** | AWS ECS Fargate + ALB | [https://api.ayurpass.com](https://api.ayurpass.com) | 🟢 Live (`/health` 200) |
| **Database** | AWS RDS PostgreSQL | `ayurpass-db.cbeacm4wet89…` | 🟢 Live (22 migrations) |
| **SSL/TLS Certificates** | AWS ACM | `*.ayurpass.com` / `api.ayurpass.com` | 🟢 Active & Managed |

## Stack

| Layer | Tech | Deployment Target |
|---|---|---|
| **API** | NestJS 11 · Prisma 6 · PostgreSQL · Stripe Connect · JWT auth | AWS ECS Fargate (`ap-southeast-2`) |
| **Web** | Next.js 16 · React 19 · Tailwind CSS v4 · Standalone Build | AWS Amplify Hosting + CloudFront CDN |
| **Mobile** | Expo 55 · React Native 0.83 · React 19 | iOS & Android (EAS / App Store) |
| **Shared** | `@ayurpass/shared` types | Shared workspace package |

## Features

- **Personalized Discovery:** Constitution-driven recommendations via 12-question Prakriti (dosha) assessment  
- **Directory & Listings:** Practices, practitioners, services, products, retreats, offers, and free listings  
- **Booking & Scheduling:** Real-time booking, room management, staff assignments, and platform commission  
- **Commerce & Products:** Products listing, transactional inventory tracking, and sales reporting  
- **Rewards & Gift Cards:** AyurPass Rewards (Seedling → Bloom → Radiance) and digital gift card redemption  
- **Provider Tools:** Provider & practitioner dashboards, calendar, enquiries management, and staff roles  
- **Privacy & Consent:** Consent-gated health profiles with detailed access audit logging  
- **Consumer App:** Mobile app for iOS & Android built with Expo SDK 55  

## Quick Start (Local Dev)

```bash
# Prerequisites: Node 20+, PostgreSQL
cp backend/.env.example backend/.env          # edit DATABASE_URL, JWT secrets
cp frontend/.env.example frontend/.env.local # NEXT_PUBLIC_API_URL

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
| `npm run dev:mobile` | Expo dev server |
| `npm run typecheck` | Typecheck all workspaces (`backend`, `frontend`, `mobile`, `shared`) |
| `npm run lint` | Lint all workspaces |
| `npm run stripe:status` | Stripe key / mock mode check |

## Infrastructure & Production Security

- **Secrets & CORS:** `NODE_ENV=production` or `AYURPASS_STRICT=1` enforces strict JWT secrets, non-wildcard `CORS_ORIGIN`, and blocks mock payments.
- **Security Headers:** Next.js frontend enforces 7 security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control).
- **Rate Limiting:** Auth endpoints throttled via `@nestjs/throttler` (10 requests/min).
- **Audit Logging:** Health data access is consent-gated and logged to `AccessAuditLog`.

## CI/CD Pipeline

Automated with GitHub Actions:
- **`ci.yml`**: Runs linting, typechecking, and builds for `backend`, `frontend`, and `mobile` on push/PR.
- **`deploy-backend.yml`**: Builds the Docker container, pushes to **AWS ECR** (`ayurpass-backend`), runs Prisma database migrations, and updates **AWS ECS Fargate** automatically on push to `main`.

## Documentation

| Doc | Contents |
|---|---|
| [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) | Roadmap & launch status |
| [docs/BUILD-LOG.md](./docs/BUILD-LOG.md) | Development & release changelog |
| [docs/PRD.md](./docs/PRD.md) | Product requirements document |
| [docs/AWS-AND-MOBILE-LAUNCH.md](./docs/AWS-AND-MOBILE-LAUNCH.md) | AWS architecture & mobile launch playbook |
| [docs/08-API-CONTRACTS.md](./docs/08-API-CONTRACTS.md) | API endpoints & contracts |
| [docs/APP_FLOW.md](./docs/APP_FLOW.md) | User journeys & app flows |

## License

Private — all rights reserved.
