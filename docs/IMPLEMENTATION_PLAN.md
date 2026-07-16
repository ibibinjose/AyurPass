# AyurPass — Implementation Plan

**Status:** Living document · **Last updated:** 2026-07-17
**Related:** [PRD](./PRD.md) · [TRD](./TRD.md) · [Backend Schema](./BACKEND_SCHEMA.md) · [BUILD-LOG](./BUILD-LOG.md)

**Guiding decision:** *enhance and complete the existing foundation — do not rewrite from scratch.* The backend (20+ modules) and web app are built and hardening. Work focuses on: live payments, tests, deploy, and mobile polish. **Hosting target: AWS/GCP, HIPAA-ready.**

---

## 1. Current status

### Built ✅
- **Backend (NestJS + Prisma + PostgreSQL):** auth (JWT access/refresh + throttling), users, providers, professionals, services, packages, rooms, bookings (18% commission), payments (Stripe Connect + mock gated out of production), products & orders, loyalty, gift cards, health profiles, treatment plans, consents (enriched + audit), enquiries, retreats, offers, integrations, admin.
- **Security (2026-07-17):** payment payer ownership, production secret/CORS hard-fail, password min length, auth rate limits, mock pay blocked in production/strict mode.
- **Web (Next.js 16 / React 19 / Tailwind v4):** marketing site, discover/explore/shop/packages/retreats/offers, book + pay, provider/admin dashboard, privacy & permissions, legal pages. UX polish: skip links, focus rings, simplified nav, retryable catalogs.
- **Mobile (Expo / React Native):** consumer app — auth → dosha → discover → book → pay → profile. Typechecks clean.

### Known gaps / debt
- Stripe Connect live path still needs provider onboarding + webhook ops in each env.
- **No Redis**, no object storage/CDN for media.
- ~~Auth guard not applied uniformly~~ ✅ **Fixed (2.1)**
- ~~Payment money-route IDOR~~ ✅ **Fixed (2026-07-17)**
- ~~Consent UI missing~~ ✅ **Consumer privacy page**
- No Docker/deploy, no Sentry, limited automated tests (CI build + typecheck only).
- `shared/` package has types; full shared API client still incomplete.
- Telehealth + AI treatment engine schema-only.
- Web JWT still in `localStorage` (prefer httpOnly cookies later).

---

## 2. Roadmap

```mermaid
flowchart LR
  P0["Phase 0<br/>Core platform + web<br/>✅ done"] --> P1["Phase 1<br/>Mobile app<br/>✅ done"]
  P1 --> P2["Phase 2<br/>Production hardening<br/>▶ next"]
  P2 --> P3["Phase 3<br/>AWS/GCP HIPAA deploy"]
  P3 --> P4["Phase 4<br/>Advanced features"]
```

### Phase 0 — Core platform ✅ (done)
Backend, data model, web app, commerce, loyalty, gift cards.

### Phase 1 — Mobile app ✅ (done)
Expo/React Native consumer app against the live API; standalone install; EAS-ready.

### Phase 2 — Production hardening (next)
**Goal:** make the platform safe, observable, and payment-real before deploying.

| # | Task | Notes |
|---|---|---|
| 2.1 | ✅ **Global `JwtAuthGuard`** + ownership checks | done |
| 2.1b | ✅ **Payment IDOR + auth throttle + prod secrets/CORS + mock-pay guard** | done 2026-07-17 |
| 2.1c | ✅ **Consent UI + enriched consents API** | done |
| 2.2 | **Stripe Connect** (real) — provider onboarding, destination charges, payouts, webhooks | keep mock for local only |
| 2.3 | **Redis** — rate limiting store, caching hot reads, refresh revocation | Upstash/ElastiCache |
| 2.4 | **Object storage** — media uploads to S3/R2 + CDN | provider logos, service images |
| 2.5 | **`shared/` package** — API client + zod for web + mobile | partial types only |
| 2.6 | **Observability** — Sentry (api/web/mobile), structured logging (no PHI) | |
| 2.7 | ✅ **CORS allowlist + HSTS (strict)**; expand CSP on Next | partial — CSP next |
| 2.8 | ✅ **Consent enforcement + audit** on health reads + consumer privacy page | |
| 2.9 | **Automated tests in CI** — unit + API e2e for money/consent/IDOR | next priority |
| 2.10 | **httpOnly session cookies** — retire `localStorage` JWT | |
| 2.11 | **SSR/pagination** for discover/explore (LCP + SEO) | |

**Exit criteria:** live payments in a test account; all protected routes guarded; errors reported to Sentry; media served from storage/CDN; e2e green in CI.

### Phase 3 — AWS/GCP HIPAA-ready deployment
**Goal:** compliant, reproducible cloud with CI/CD.

| # | Task |
|---|---|
| 3.1 | **Dockerize** backend (and web); multi-stage builds |
| 3.2 | **Infrastructure as Code** (Terraform/CDK): VPC, ECS Fargate, RDS PostgreSQL+PostGIS, ElastiCache Redis, S3, CloudFront, ALB, Secrets Manager |
| 3.3 | **CI/CD** (GitHub Actions): lint → typecheck → test → build → migrate → deploy; staging + prod |
| 3.4 | **HIPAA**: sign BAA; encryption at rest (KMS) + in transit; audit logging; least-privilege IAM; backup/PITR |
| 3.5 | **Mobile release**: EAS Build + Submit to App Store & Play Store; production `apiUrl`; OTA updates |
| 3.6 | **Runbooks**: on-call, incident response, restore drills |

**Exit criteria:** one-command deploy to staging; blue/green or rolling prod deploy; RDS backups + tested restore; BAA in place.

### Phase 4 — Advanced features (future)
- **Telehealth** — Twilio Programmable Video for virtual sessions.
- **AI treatment-plan engine** — populate `TreatmentPlan.phases` from dosha profile + goals (see `docs/09-AI-TREATMENT-PLAN-ENGINE.md`).
- **Analytics suite** for providers; premium listings; white-label (Enterprise).
- **Geo discovery** using `Consumer.location` (PostGIS radius search).

---

## 3. Workstreams & ownership (suggested)

| Workstream | Scope |
|---|---|
| Platform/API | Guards, payments, Redis, consent, tests |
| Web | Dashboard polish, media uploads, provider onboarding |
| Mobile | Payments UX, push notifications, provider app (later) |
| Infra/DevOps | IaC, CI/CD, monitoring, HIPAA |
| Data | Migrations, seed/fixtures, analytics |

---

## 4. Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| PHI handling before compliance | High | No real PHI until HIPAA infra + BAA; consent + audit enforced first |
| Mock → live payments regressions | High | Keep mock provider for tests; Stripe test mode; webhook idempotency |
| RN/monorepo tooling friction | Med | Mobile installed standalone (not hoisted); pinned Expo SDK; `expo install --fix` |
| Type drift web ↔ mobile | Med | Extract `shared/` package (Phase 2.5) |
| Backend won't boot on TS error | Med | CI typecheck gate; `nest build` in pipeline |
| Cost of AWS/HIPAA at low scale | Med | Start staging small; right-size; managed alternative for non-PHI marketing |

---

## 5. Definition of done (per feature)
1. Typechecks + lints clean (web, mobile, backend).
2. Server-side validation + authorization (guard + ownership).
3. Unit/e2e tests for money/consent-critical paths.
4. No PHI in logs; audit written where applicable.
5. Docs updated (this folder) and migrations committed.

---

## 6. Immediate next step
**Phase 2.1 is done** (global `JwtAuthGuard` + `@Public()` + consumer ownership checks, verified). Next up is **Phase 2.2 — real Stripe Connect** (provider onboarding, destination charges, payouts, webhooks), keeping the mock provider for local/dev, followed by Redis and media storage. See the TRD for the payments abstraction and hosting target.

### Follow-ups within 2.1 (remaining ownership surface)
- Provider-scoped routes (`/bookings/provider/:id`, `/orders/provider/:id`, provider dashboard mutations) should verify the caller owns/administers that provider (needs a provider→user ownership lookup).
- Single-resource reads (`GET /bookings/:id`, `/orders/:id`) should verify the caller is a party to the resource.
- Catalog mutations (`POST/PUT/DELETE` on services/products/packages/rooms) should verify provider ownership.
