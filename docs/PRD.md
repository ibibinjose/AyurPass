# AyurPass — Product Requirements Document (PRD)

**Status:** Living document · **Last updated:** 2026-07-15
**Related:** [TRD](./TRD.md) · [UI/UX](./UI_UX_DESIGN.md) · [App Flows](./APP_FLOW.md) · [Backend Schema](./BACKEND_SCHEMA.md) · [Implementation Plan](./IMPLEMENTATION_PLAN.md)

---

## 1. Overview

**AyurPass** is a dual-sided, premium global wellness ecosystem that unifies **Ayurveda, Yoga, Meditation, Luxury Spa, and Health Club** experiences under one intelligent platform. Every recommendation is personalised to a member's **Prakriti** (Ayurvedic constitution) through a guided dosha assessment.

- **Consumers** discover verified providers, book services and packages, buy wellness products, and follow personalised treatment plans.
- **Providers** (clinics, studios, spas, retreats) run their business — scheduling, staff, payments, analytics — and reach clients matched to their specialty.

### Vision
Make authentic, personalised wellness accessible worldwide, blending ancient Vedic wisdom with modern software.

### Problem
Wellness discovery is fragmented and generic. Clients can't easily find *verified*, *authentic* practitioners or understand which treatments suit *their* body. Providers lack affordable, integrated tooling to manage bookings, commerce, and growth.

---

## 2. Goals & non-goals

### Goals
- A personalised marketplace driven by a dosha (Prakriti) assessment.
- Verified provider profiles across five disciplines.
- Unified booking, payments, commerce (products), loyalty, and gift cards.
- Privacy-first handling of health data (consent + audit trail).
- Native mobile apps (iOS + Android) and a responsive web app.

### Non-goals (for the current phase)
- Real-time telehealth video (planned — Twilio, later phase).
- AI-generated treatment plans at scale (schema exists; engine is future work).
- Insurance claims / billing integrations.
- Social feed / community forum.

---

## 3. Target users & personas

| Persona | Role | Needs |
|---|---|---|
| **Ananya** — wellness seeker | `CONSUMER` | Understand her constitution, find trustworthy practitioners, book easily, track her plan |
| **Dr. Vaidya** — solo practitioner | `PROFESSIONAL` | A verified profile, a global audience, simple scheduling and payouts |
| **Veda Wellness** — clinic/studio owner | `PROVIDER_ADMIN` | Manage staff, rooms, services, products, analytics, and multi-practitioner scheduling |
| **Platform ops** | `PLATFORM_ADMIN` | Verify providers, monitor volume/revenue, resolve issues |

---

## 4. Functional requirements

### 4.1 Accounts & identity
- Email/password registration for consumers and providers; JWT sessions (access + refresh).
- Roles: `CONSUMER`, `PROFESSIONAL`, `PROVIDER_ADMIN`, `PLATFORM_ADMIN`.
- Provider sign-up creates a linked Provider + Professional record.
- Profile management (name, phone, avatar).

### 4.2 Prakriti (dosha) assessment
- 12-question guided assessment scoring **Vata / Pitta / Kapha** as percentages.
- Result persisted as a Health Profile; drives personalised recommendations.
- Retakeable at any time.

### 4.3 Discovery
- Browse/search **providers** by name, type, city, country.
- Browse **services** by category (Ayurveda, Yoga, Spa, Meditation, Fitness, Consultation, Package).
- Provider profiles with brand info, verification status, and their services.

### 4.4 Booking
- Book a service for a chosen date/time; server computes end time from duration.
- Booking lifecycle: `PENDING → CONFIRMED → IN_PROGRESS → COMPLETED` (or `CANCELLED` / `NO_SHOW`).
- Optional room and professional assignment; optional client notes.
- Platform commission (18%) computed server-side; provider payout derived.

### 4.5 Payments
- Checkout for bookings and product orders.
- **Currently a mock payment provider** (deterministic, for dev/demo); **Stripe Connect** is the planned production integration.
- Redemption at checkout: **gift cards** and **loyalty points** (atomic, race-safe).
- Refunds for bookings and orders.

### 4.6 Commerce (products)
- Providers list wellness products with inventory.
- Consumers order products; stock decrements transactionally; 12% commission.
- Order lifecycle: `PENDING → PAID → FULFILLED` (or `CANCELLED` / `REFUNDED`); stock restored on cancel.

### 4.7 Loyalty & gift cards
- **AyurPass Rewards**: earn 1 point per $1 of card-paid spend; 1 point = $0.05; tiers **Seedling → Bloom (500) → Radiance (2000)**.
- **Gift cards**: purchasable, `AYUR-XXXX-XXXX-XXXX` codes, redeemable at checkout.
- Points earned only on the cash-paid remainder (no farming loop).

### 4.8 Packages & treatment plans
- Providers offer multi-day wellness **packages** (each auto-linked to a bookable service).
- **Treatment plans** per consumer (phased, optionally AI-generated) — data model in place.

### 4.9 Provider business tools
- Manage services, products, packages, treatment rooms, staff (professionals), and client CRM records.
- **Unlimited appointments & recurring series** (weekly, bi-weekly, monthly) with conflict detection.
- **Block customers**: CRM protection against repeat no-shows, harassment, or chargeback fraud with booking enforcement.
- **2-Way Calendar Sync**: live bi-directional sync with Google Calendar, Apple Calendar, and Outlook (.ics feed).
- **Accept payments & deposits** via Stripe Connect with direct bank payouts.
- **Branded Booking Page** (`ayurpass.com/@yourbrand`) and directory listing with credentials.
- **Automated email communications**: instant confirmations with `.ics` calendar invites, plus 24h & 2h reminders.
- **Integrations with leading apps**: Google Calendar two-way sync, Apple iCal, Square POS inventory, Stripe Payments, and Mailchimp.
- **Native iOS and Android apps** for on-the-go practitioner schedule and client booking.
- **Team collaboration tools**: multi-practitioner schedules, treatment room assignment, role permissions, and clinical notes.
- Tiered SaaS: **Free listing $0, Growth $369/mo, Enterprise custom** (including dedicated Branded Mobile App).

### 4.10 Privacy & consent
- Health data shared with a practitioner only on booking, scoped by **consent** records.
- **Access audit log** for sensitive-data reads.
- Auth/user responses strip `passwordHash`.

### 4.11 Admin
- Provider verification (pending/verified/rejected).
- Platform overview: users, volume, revenue, outstanding gift cards/points.

---

## 5. Non-functional requirements

| Area | Requirement |
|---|---|
| **Security** | JWT with separate access/refresh secrets; bcrypt password hashing; least-privilege data access; no PHI in logs |
| **Privacy / compliance** | Consent-gated health data, audit logging; **HIPAA-eligible hosting** is the target (AWS/GCP with BAA) |
| **Performance** | Sub-300ms typical API responses; geo search via PostGIS; Redis caching (planned) |
| **Availability** | 99.9% target once on managed cloud |
| **Accessibility** | WCAG 2.1 AA; dosha meter colours validated for colour-vision deficiency |
| **Localisation** | USD default, multi-currency-ready `currency` field; i18n-ready copy |
| **Portability** | Web (responsive) + native iOS/Android from a shared API |

---

## 6. Success metrics

- **Activation:** % of new consumers who complete the dosha assessment.
- **Conversion:** assessment → first booking rate.
- **GMV & take rate:** gross booking/product volume × commission.
- **Retention:** repeat-booking rate; loyalty tier progression.
- **Provider health:** active providers, listings per provider, payout reliability.
- **Trust:** % verified providers; consent coverage on health-data access.

---

## 7. Monetisation

1. Marketplace commission — **18%** bookings, **12%** products.
2. Provider SaaS subscriptions — Starter / Growth / Enterprise.
3. Premium listings, data insights, white-label (future).

---

## 8. Scope & phasing (summary)

| Phase | Scope | Status |
|---|---|---|
| 0 | Core platform: auth, providers, services, bookings, commerce, loyalty, gift cards, web app | ✅ Built |
| 1 | Native mobile app (consumer) | ✅ Built |
| 2 | Production hardening (Redis, real Stripe Connect, media storage, monitoring, shared types) | ⬜ Planned |
| 3 | AWS/GCP HIPAA-ready deployment + CI/CD | ⬜ Planned |
| 4 | Advanced: telehealth video, AI treatment-plan engine, analytics suite | ⬜ Future |

See the [Implementation Plan](./IMPLEMENTATION_PLAN.md) for detail.

---

## 9. Out of scope (now)
Insurance/claims, in-app social community, marketplace of physical retail logistics beyond simple product orders, and multi-tenant white-label theming (Enterprise, later).
