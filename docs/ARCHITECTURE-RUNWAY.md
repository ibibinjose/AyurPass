# AyurPass Architecture Runway (12–18 months)

Living checklist for multi-platform growth without a rewrite.  
Stack: Turborepo · NestJS API · Next.js dashboard/web · Expo mobile · `@ayurpass/shared` · TanStack Query · NativeWind/Tailwind tokens.

## Principles (do not abandon)

1. **One monorepo** until independent teams force a split.
2. **Modular monolith API** first; extract services only when a domain is hot and independently scalable.
3. **Shared contracts** (types, endpoints, tokens, query keys) live in `packages/shared`.
4. **TanStack Query** for server state; thin Auth context only for session identity.
5. **Design tokens first** — screens do not invent hex codes.

## Current layout

```text
apps/api           NestJS + Prisma + Stripe
apps/dashboard     Next.js marketplace + provider/admin shell
apps/mobile        Expo (iOS/Android) + NativeWind
packages/shared    Types, tokens, endpoints, HTTP helpers, query keys
```

## Phase 0 — Foundation (done / in progress)

- [x] Turborepo workspaces (`apps/*`, `packages/*`)
- [x] Shared design tokens + endpoint map + query key factory
- [x] TanStack Query providers (dashboard + mobile)
- [x] NativeWind on mobile UI kit + core tabs
- [x] Admin providers verification via Query mutations
- [ ] Token file is the **only** color source for mobile Tailwind + web CSS (keep `tokens.ts` → configs in sync)
- [ ] CI filters per app (`turbo run typecheck --filter=...`) on every PR

## Phase 1 — Product polish (0–3 months)

### Mobile

- [x] Discover / Book / Bookings / Profile on NativeWind + Query where applicable
- [ ] Offline-friendly empty states + retry banners on all list screens
- [ ] Deep links: booking, provider, offer
- [ ] Push notifications (booking reminders)
- [ ] Stripe PaymentSheet on device (replace “pay on web” path)

### Dashboard / web

- [x] Query hooks for admin providers, consumer bookings, provider services, admin overview
- [ ] Migrate remaining dashboard list pages (orders, products, staff, enquiries) to Query
- [ ] Dashboard bundle analysis; lazy-load heavy admin modules
- [ ] Role shells: consumer vs provider vs platform density

### API / data

- [ ] Indexes for directory search (`provider.type`, geo, verification, service.category)
- [ ] Background jobs queue for email + Stripe webhook fan-out
- [ ] Structured logging + request IDs
- [ ] OpenAPI export from Nest DTOs (optional)

### Design

- [ ] Document component patterns (cards, chips, verified tick, empty state)
- [ ] Motion guidelines (duration, easing) shared web/mobile
- [ ] Accessibility pass: focus rings, contrast, screen reader labels

## Phase 2 — Scale readiness (3–9 months)

| Area | Action | Trigger |
|------|--------|---------|
| Search | Meilisearch / OpenSearch for directory | >10k listings or slow discover |
| Cache | Redis for sessions / rate limits / hot catalogs | Sustained API latency |
| Media | All uploads → S3 + CloudFront only | Production media volume |
| Split web | `apps/web` (SEO marketplace) + `apps/admin` (ops) | Bundle size / auth friction |
| `packages/ui` | Web design system package | 3+ designers/engineers on UI |
| Read replicas | Postgres read replica for reports | Heavy admin analytics |

## Phase 3 — Platform maturity (9–18 months)

- Multi-region API only if latency demands it (start with APAC)
- Ledger / payout reconciliation service if Stripe Connect volume is high
- Feature flags (LaunchDarkly / open source) for marketplace experiments
- Mobile store release trains + EAS channels (dev / preview / production)
- Compliance pack: consent audit exports, data retention jobs, DPIA templates

## Anti-patterns (avoid)

| Avoid | Prefer |
|-------|--------|
| Microservices “for scale” | Module boundaries + extract when measured |
| Giant Redux store | Query + small auth context |
| Copy-paste hex in screens | Shared tokens |
| Separate repos for mobile/web | Monorepo packages |
| Flutter rewrite | Invest in Expo + NativeWind craft |

## Ownership map (suggested)

| Package / app | Owner focus |
|---------------|-------------|
| `apps/api` | Domain correctness, payments, RLS-ish ownership guards |
| `apps/dashboard` | Marketplace SEO + provider ops UX |
| `apps/mobile` | Consumer booking journey + polish |
| `packages/shared` | Contracts — breaking changes need version note in PR |

## Success metrics

- Typecheck green on Turbo for all workspaces every PR
- P95 booking create < 500ms (API)
- Mobile cold start tolerable on mid devices
- Zero drift: provider verification status same on admin web and mobile directory
- Design: same forest/gold/ivory language on all three surfaces

## Related docs

- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- [UI_UX_DESIGN.md](./UI_UX_DESIGN.md)
- [TRD.md](./TRD.md)
- Root [README.md](../README.md)
