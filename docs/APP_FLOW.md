# AyurPass — Application Flows

**Status:** Living document · **Last updated:** 2026-07-15
**Related:** [PRD](./PRD.md) · [UI/UX](./UI_UX_DESIGN.md) · [Backend Schema](./BACKEND_SCHEMA.md)

Diagrams use Mermaid (renders on GitHub and most viewers). Endpoints referenced here are defined in [BACKEND_SCHEMA.md](./BACKEND_SCHEMA.md#rest-api-reference).

---

## 1. Consumer onboarding

```mermaid
flowchart TD
  A[Open app / site] --> B{Has account?}
  B -- No --> C[Register\nPOST /auth/register]
  B -- Yes --> D[Login\nPOST /auth/login]
  C --> E[Store JWTs\nsecure-store / localStorage]
  D --> E
  E --> F[Prakriti assessment\n12 questions]
  F --> G[Score Vata/Pitta/Kapha]
  G --> H[Save\nPOST /health-profiles/consumer/:id]
  H --> I[Personalised Discover]
  F -. skip .-> I
```

The assessment can be retaken anytime from Profile; results persist to the Health Profile.

---

## 2. Provider onboarding

```mermaid
flowchart TD
  A[Register as provider\nrole = PROVIDER_ADMIN] --> B[Backend creates\nUser + Provider + Professional]
  B --> C[verificationStatus = pending]
  C --> D[Admin reviews\nPUT /admin/providers/:id/verification]
  D -->|verified| E[Listing visible\n+ verified badge]
  E --> F[Add services / products / packages / rooms / staff]
  F --> G[Connect payouts\nStripe Connect · planned]
```

---

## 3. Booking lifecycle

```mermaid
stateDiagram-v2
  [*] --> PENDING: POST /bookings (commission 18% computed)
  PENDING --> CONFIRMED: payment captured
  CONFIRMED --> IN_PROGRESS: session starts
  IN_PROGRESS --> COMPLETED: session ends
  PENDING --> CANCELLED: cancel (within window)
  CONFIRMED --> CANCELLED: cancel / refund
  CONFIRMED --> NO_SHOW: client absent
  COMPLETED --> [*]
  CANCELLED --> [*]
```

Booking creation computes `platformCommission` and `providerPayout` server-side; `startTime`/`endTime` derive from the service duration.

---

## 4. Checkout & payment (with redemption)

```mermaid
sequenceDiagram
  participant C as Client
  participant API as API (payments)
  participant GC as Gift cards
  participant LP as Loyalty
  participant PAY as Provider (mock → Stripe)

  C->>API: POST /payments/checkout/:bookingId {giftCardCode?, redeemPoints?}
  API->>GC: atomic redeem (guarded updateMany)
  API->>LP: redeem points (race-safe)
  Note over API: remainder = total − giftCard − pointsValue
  API->>PAY: charge remainder (mock deterministic / Stripe)
  PAY-->>API: paid
  API->>LP: earn points on cash-paid remainder (1 pt/$1)
  API-->>C: booking {status, paymentStatus: paid, pointsEarned}
```

Refunds: `POST /payments/refund/:bookingId` (and `.../refund-order/:orderId`).

---

## 5. Commerce (product order)

```mermaid
flowchart TD
  A[Browse products\nGET /products] --> B[Create order\nPOST /orders]
  B --> C[Transactionally decrement stock\ncommission 12%]
  C --> D[Pay\nPOST /payments/checkout-order/:orderId]
  D --> E[status PAID]
  E --> F[Provider fulfils → FULFILLED]
  B -. cancel .-> G[CANCELLED\nstock restored]
```

---

## 6. Loyalty & gift cards

```mermaid
flowchart LR
  subgraph Earn
    P[Card-paid spend] --> PTS[+1 pt per $1\ncash-paid remainder only]
  end
  subgraph Redeem
    R[Checkout redeemPoints] --> V[1 pt = $0.05\natomic, race-safe]
  end
  subgraph Tiers
    T1[Seedling] --> T2[Bloom · 500] --> T3[Radiance · 2000]
  end
  subgraph GiftCards
    G1[Purchase\nPOST /gift-cards/purchase] --> G2[AYUR-XXXX-XXXX-XXXX]
    G2 --> G3[Redeem at checkout\natomic guarded update]
  end
```

---

## 7. Privacy, consent & audit

```mermaid
sequenceDiagram
  participant Cl as Consumer
  participant API as API
  participant Pr as Practitioner

  Cl->>API: Book with practitioner
  API->>API: Create/scope ClientConsent (health data)
  Pr->>API: Read consumer health profile
  API->>API: Check consent (status/scope/expiry)
  API->>API: Write AccessAuditLog (accessor, action, purpose)
  API-->>Pr: Scoped data (or denied)
```

Health data is shared only to deliver a booked service; every sensitive read is auditable. Consent can be revoked (`DELETE /consents/:id`).

---

## 8. Admin operations

```mermaid
flowchart TD
  A[Admin dashboard] --> B[GET /admin/overview\nusers, volume, revenue, outstanding pts/gift cards]
  A --> C[GET /admin/providers → verify\nPUT /admin/providers/:id/verification]
  A --> D[GET /admin/bookings]
  A --> E[GET /admin/users]
```

All `admin/*` routes are protected by `AdminGuard` (JWT role check).

---

## 9. Session & token refresh

```mermaid
sequenceDiagram
  participant C as Client
  participant API as API
  C->>API: request with access token
  API-->>C: 401 (expired)
  C->>API: POST /auth/refresh {refreshToken}
  API-->>C: new {accessToken, refreshToken}
  C->>API: retry original request
  Note over C: on refresh failure → clear tokens → login
```

Web stores tokens in `localStorage`; mobile in `expo-secure-store`. Both auto-refresh once, then fall back to login.
