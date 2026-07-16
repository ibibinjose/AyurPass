# AyurPass — Documentation

Engineering and product documentation for **AyurPass**, a dual-sided premium wellness ecosystem (Ayurveda · Yoga · Meditation · Spa · Health Club) with a NestJS API, a Next.js web app, and an Expo (React Native) mobile app.

## Core documents

| # | Document | Description |
|---|----------|-------------|
| 1 | [PRD.md](./PRD.md) | Product Requirements — vision, personas, features, metrics, scope |
| 2 | [TRD.md](./TRD.md) | Technical Requirements — architecture, stack, security, hosting |
| 3 | [UI_UX_DESIGN.md](./UI_UX_DESIGN.md) | UI/UX Design — brand, tokens, components, navigation |
| 4 | [APP_FLOW.md](./APP_FLOW.md) | Application Flows — onboarding, booking, payments, consent (diagrams) |
| 5 | [BACKEND_SCHEMA.md](./BACKEND_SCHEMA.md) | Backend Schema — data model, ERD, full REST API reference |
| 6 | [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Implementation Plan — status, phased roadmap, risks |

## Blueprint (background)

| Document | Description |
|---|---|
| [00-EXECUTIVE-OVERVIEW.md](./00-EXECUTIVE-OVERVIEW.md) | Executive overview |
| [01-BUSINESS-STRATEGY.md](./01-BUSINESS-STRATEGY.md) | Business strategy |
| [02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md) | Original database schema |
| [03-ADVANCED-FEATURES.md](./03-ADVANCED-FEATURES.md) | Advanced features |
| [04-INTEGRATIONS.md](./04-INTEGRATIONS.md) | Integrations |
| [05-USER-JOURNEYS.md](./05-USER-JOURNEYS.md) | User journeys |
| [06-ADDITIONAL-FEATURES.md](./06-ADDITIONAL-FEATURES.md) | Additional features |
| [07-PRISMA-SCHEMA.md](./07-PRISMA-SCHEMA.md) | Prisma schema notes |
| [08-API-CONTRACTS.md](./08-API-CONTRACTS.md) | API contracts |
| [09-AI-TREATMENT-PLAN-ENGINE.md](./09-AI-TREATMENT-PLAN-ENGINE.md) | AI treatment-plan engine |
| [BUILD-LOG.md](./BUILD-LOG.md) | Build log |

## Conventions
- The **core documents** describe the system *as built*, marking what is implemented, mocked, or planned.
- Source of truth for data/API is `backend/prisma/schema.prisma` and `backend/src/modules/**`; the docs are kept in sync with it.
- Diagrams use Mermaid (render on GitHub and most Markdown viewers).

_Last updated: 2026-07-15._
