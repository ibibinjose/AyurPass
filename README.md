# AyurPass — Find & book Ayurveda, Yoga & Wellness

Premium wellness marketplace for **Ayurveda, yoga, luxury spa, meditation, health clubs and retreats** — a dual-sided platform for consumers and practitioners.

[![CI](https://github.com/ibibinjose/AyurPass/actions/workflows/ci.yml/badge.svg)](https://github.com/ibibinjose/AyurPass/actions/workflows/ci.yml)
[![Deploy Backend](https://github.com/ibibinjose/AyurPass/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/ibibinjose/AyurPass/actions/workflows/deploy-backend.yml)

## Live Production Environments

| Layer | Environment | Live URL | Status |
|---|---|---|---|
| **Web Frontend** | AWS Amplify (CloudFront CDN) | [https://ayurpass.com](https://ayurpass.com) | 🟢 Live (HTTP/2, SSL) |
| **Backend API** | AWS ECS Fargate + ALB | [https://api.ayurpass.com](https://api.ayurpass.com) | 🟢 Live (`/health` 200) |
| **Database** | AWS RDS PostgreSQL | `ayurpass-db.cbeacm4wet89…` | 🟢 Live (24+ migrations) |
| **SSL/TLS Certificates** | AWS ACM | `*.ayurpass.com` / `api.ayurpass.com` | 🟢 Active & Managed |

## Monorepo layout (Turborepo)

```text
apps/
  api/          NestJS + Prisma backend (@ayurpass/api)
  dashboard/    Next.js web + admin dashboard (@ayurpass/dashboard)
  mobile/       Expo iOS/Android app (@ayurpass/mobile)
packages/
  shared/       Types, tokens, endpoints, HTTP helpers (@ayurpass/shared)
```

## Stack

| Layer | Tech | Deployment Target |
|---|---|---|
| **API** | NestJS 11 · Prisma 7.9.0 · PostgreSQL · PostGIS · Stripe Connect · JWT auth | AWS ECS Fargate (`ap-southeast-2`) |
| **Web / Dashboard** | Next.js 16 · React 19 · Tailwind CSS v4 · TanStack Query v5 | AWS Amplify Hosting + CloudFront CDN |
| **Mobile** | Expo SDK 55 · React Native 0.83 · NativeWind · TanStack Query | iOS & Android (EAS / App Store) |
| **Shared** | `@ayurpass/shared` types, design tokens, API contracts | Workspace package |

## Features

- **Personalized Discovery:** Constitution-driven recommendations via 12-question Prakriti (dosha) assessment  
- **Directory & Listings:** Practices, practitioners, services, products, retreats, offers, health clubs, job listings, and free listings  
- **Booking & Scheduling:** Real-time booking, multi-room management, staff assignments, and platform commission  
- **Commerce & Products:** Full e-commerce stack with inventory tracking, POS, sales reporting, and order fulfillment  
- **Rewards & Loyalty:** AyurPass Rewards (Seedling → Bloom → Radiance), digital gift cards, and promotions  
- **Provider Tools:** Comprehensive dashboards, calendar, enquiries management, staff roles, and vanity URLs  
- **Health Profiles & Consent:** Consent-gated health profiles with detailed access audit logging and privacy controls  
- **Professional Credentials:** Registration numbers, health authority verification, and credential management  
- **Wellness Events & Passes:** Event management and subscription-based wellness passes  
- **POS & CRM:** Point-of-sale system and customer relationship management tools  
- **Reviews & Quality:** Quality management with reviews, reactions, and reports  
- **Integrations:** Google Calendar sync, Stripe Connect, and multi-country payment processing  
- **Consumer App:** Mobile app for iOS & Android built with Expo SDK 55  

## Quick Start (Local Dev)

```bash
# Prerequisites: Node 20+, PostgreSQL with PostGIS
cp apps/api/.env.example apps/api/.env
cp apps/dashboard/.env.example apps/dashboard/.env.local
# optional mobile: copy apps/mobile/.env.example → apps/mobile/.env

npm install
npm run prisma:generate
npm run prisma:migrate
npm start   # API :4000 + dashboard :3000
```

| Script | Purpose |
|---|---|
| `npm start` / `npm run dev` | API + dashboard together |
| `npm run dev:api` | Nest watch mode |
| `npm run dev:dashboard` | Next.js web/dashboard |
| `npm run dev:mobile` | Expo (iOS/Android) |
| `npm run typecheck` | Typecheck all workspaces via Turbo |
| `npm run lint` | Lint workspaces via Turbo |
| `npm run stripe:status` | Stripe key / mock mode check |
| `npm run seed:local` | Seed local database with demo data |

## Infrastructure & Production Security

- **Secrets & CORS:** `NODE_ENV=production` or `AYURPASS_STRICT=1` enforces strict JWT secrets, non-wildcard `CORS_ORIGIN`, and blocks mock payments.
- **Security Headers:** Next.js frontend enforces 7 security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control).
- **Rate Limiting:** Auth endpoints throttled via `@nestjs/throttler` (10 requests/min).
- **Audit Logging:** Health data access is consent-gated and logged to `AccessAuditLog`.
- **Database:** PostgreSQL with PostGIS extension for location-based services.

## CI/CD Pipeline

Automated with GitHub Actions:
- **`ci.yml`**: Lints/typechecks/builds `apps/api`, `apps/dashboard`, `packages/shared`, and typechecks `apps/mobile`.
- **`deploy-backend.yml`**: Builds `apps/api` Docker image, pushes to **AWS ECR** (`ayurpass-backend`), updates **AWS ECS Fargate** on `main`.

## Documentation

| Doc | Contents |
|---|---|
| [docs/ARCHITECTURE-RUNWAY.md](./docs/ARCHITECTURE-RUNWAY.md) | 12–18 month scale & design runway |
| [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) | Roadmap & launch status |
| [docs/BUILD-LOG.md](./docs/BUILD-LOG.md) | Development & release changelog |
| [docs/PRD.md](./docs/PRD.md) | Product requirements document |
| [docs/AWS-AND-MOBILE-LAUNCH.md](./docs/AWS-AND-MOBILE-LAUNCH.md) | AWS architecture & mobile launch playbook |
| [docs/08-API-CONTRACTS.md](./docs/08-API-CONTRACTS.md) | API endpoints & contracts |
| [docs/APP_FLOW.md](./docs/APP_FLOW.md) | User journeys & app flows |
| [RUN_APP.md](./RUN_APP.md) | How to run the application |
| [SETUP_LOCAL.md](./SETUP_LOCAL.md) | Local development setup guide |

## New Features (Recent Additions)

- **Health Clubs & Fitness:** Dedicated provider type with specialized features for gyms and fitness centers
- **Job Listings:** Employment opportunities in wellness sector
- **Wellness Events & Passes:** Subscription-based access to events and programs
- **Device Push Tokens:** Mobile notification infrastructure
- **Provider Currency Support:** Multi-currency capabilities for international providers
- **Professional Slugs:** Custom vanity URLs for professionals
- **Provider Slugs:** Custom vanity URLs for providers
- **POS Inventory & CRM:** Point-of-sale and customer management systems
- **Credentials & Authorities:** Professional registration and licensing verification
- **Handles & Vanity Titles:** Custom URLs and titles for providers and professionals
- **Reviews, Reactions & Reports:** Quality management system
- **Service Quality Counts:** Analytics and metrics for services
- **Email Verification:** Account verification process
- **Forgot Password:** Password recovery flow

## License

Private — all rights reserved.