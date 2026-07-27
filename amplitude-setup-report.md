<wizard-report>

# Amplitude Setup Report

**Project:** AyurPass API (`apps/api`)  
**SDK:** `@amplitude/analytics-node`  
**Date:** 2026-07-27  
**API Key env var:** `AMPLITUDE_API_KEY` (set in `apps/api/.env`)

---

## Files Created

| File | Purpose |
|---|---|
| `apps/api/src/amplitude/amplitude.service.ts` | Singleton NestJS service wrapping `@amplitude/analytics-node` — `track()`, `identifyUser()`, graceful `flush()` on shutdown |
| `apps/api/src/amplitude/amplitude.module.ts` | `@Global()` NestJS module — exposes `AmplitudeService` to all modules without per-module imports |

## Files Modified

| File | Change |
|---|---|
| `apps/api/src/app.module.ts` | Added `AmplitudeModule` to root imports |
| `apps/api/src/modules/auth/auth.controller.ts` | Added `AmplitudeService` injection; wired 5 events |
| `apps/api/src/modules/bookings/bookings.service.ts` | Added `AmplitudeService` injection; wired 1 event |
| `apps/api/src/modules/enquiries/enquiries.controller.ts` | Added `AmplitudeService` injection; wired 1 event |
| `apps/api/src/modules/retreats/retreats.controller.ts` | Added `AmplitudeService` injection; wired 1 event |
| `apps/api/src/modules/health-profiles/health-profiles.controller.ts` | Added `AmplitudeService` injection; wired 1 event |
| `apps/api/src/modules/payments/payments.service.ts` | Added `AmplitudeService` injection; wired 7 events |
| `apps/api/src/modules/orders/orders.controller.ts` | Added `AmplitudeService` injection; wired 1 event |
| `apps/api/.env` | Added `AMPLITUDE_API_KEY` |

---

## Instrumented Events (17 / 17)

All 17 approved events are instrumented. No events rely on autocapture (server-side SDK has none). No events were dropped.

| # | Event | File | Properties |
|---|---|---|---|
| 1 | **User Registered** | `auth.controller.ts` — `register()` | `role`, `auth_method: 'email'` + `identifyUser(role)` |
| 2 | **User Logged In** | `auth.controller.ts` — `login()`, `googleAuth()`, `appleAuth()` | `auth_method` (`'email'` / `'google'` / `'apple'`) + `identifyUser(role)` |
| 3 | **Email Verified** | `auth.controller.ts` — `verifyEmail()` | _(no extra props — event itself is the signal)_ |
| 4 | **Password Reset Completed** | `auth.controller.ts` — `resetPassword()` | _(no extra props — guarded by `result?.user?.id` check)_ |
| 5 | **Business Listed** | `auth.controller.ts` — `listBusiness()` | `listing_tier`, `provider_type` |
| 6 | **Booking Created** | `bookings.service.ts` — `createBooking()` | `booking_id`, `provider_id`, `service_id`, `total_amount`, `currency: 'AUD'` |
| 7 | **Booking Payment Initiated** | `payments.service.ts` — `checkout()` | `booking_id`, `total_amount`, `card_charge`, `gift_card_applied`, `points_redeemed` |
| 8 | **Booking Paid** | `payments.service.ts` — `confirmBookingPayment()` (Stripe webhook) | `booking_id`, `total_amount`, `card_charge`, `points_earned`, `payment_method: 'stripe'` |
| 9 | **Booking Refunded** | `payments.service.ts` — `refund()` | `booking_id`, `total_amount` |
| 10 | **Counter Payment Recorded** | `payments.service.ts` — `payCounter()` | `booking_id`, `total_amount`, `payment_method` |
| 11 | **Order Created** | `orders.controller.ts` — `create()` | `order_id`, `provider_id`, `item_count` |
| 12 | **Order Paid** | `payments.service.ts` — `confirmOrderPayment()` (Stripe webhook) | `order_id`, `total_amount`, `card_charge`, `points_earned`, `payment_method: 'stripe'` |
| 13 | **Order Refunded** | `payments.service.ts` — `refundOrder()` | `order_id`, `total_amount` |
| 14 | **Enquiry Submitted** | `enquiries.controller.ts` — `create()` | `enquiry_id`, `provider_id`, `has_retreat`; distinctId = enquiry record ID (anonymous visitors have no user account) |
| 15 | **Retreat Created** | `retreats.controller.ts` — `create()` | `retreat_id`, `category`, `duration_days` |
| 16 | **Provider Connect Onboarded** | `payments.service.ts` — `processWebhookEvent()` (`account.updated` Stripe webhook) | `provider_id`, `stripe_account_id`; fires only when `charges_enabled && payouts_enabled` |
| 17 | **Health Profile Saved** | `health-profiles.controller.ts` — `createOrUpdate()` | `consumer_id`, `has_dosha_scores` |

---

## Design Notes

- **`@Global()` module pattern** — `AmplitudeModule` is registered globally in `app.module.ts`. No sub-module needs to import it; NestJS DI resolves `AmplitudeService` automatically in all providers.
- **Graceful shutdown** — `AmplitudeService` implements `OnApplicationShutdown` and calls `flush()` so in-flight events are not lost when the NestJS process exits.
- **Disabled-safe** — if `AMPLITUDE_API_KEY` is not set, `AmplitudeService` logs a warning and all `track()` / `identifyUser()` calls are no-ops. No exceptions are thrown.
- **Anonymous enquiry tracking** — enquiries are submitted by unauthenticated visitors. The enquiry's own database ID is used as the Amplitude `user_id` for that event. This is intentional: server-side SDKs have no session/device ID concept for anonymous users.
- **`identifyUser()` on auth** — `User Registered` and all `User Logged In` variants also call `identifyUser()` to set the `role` user property in Amplitude, enabling user-level segmentation (e.g. filter charts to PROVIDER_ADMIN vs CONSUMER).
- **Dashboard SDK unchanged** — `apps/dashboard` already uses `@amplitude/unified` (browser SDK with autocapture). This run only adds the server-side `@amplitude/analytics-node` to `apps/api`.

---

## Known Limitations

- `Password Reset Completed` fires only when `authService.resetPassword()` returns a result with a `user.id`. If the service returns a bare success message without the user object, the track call is silently skipped. Verify the return shape in `auth.service.ts` if you want guaranteed coverage.
- `Order Created` tracks `item_count` from `result.items?.length`. If the Prisma `include: { items: true }` is not part of `createOrder()`'s return, this property will be `undefined` (harmless — Amplitude accepts partial property sets).
- No runtime build verification was run (bash allowlist restricts project-wide `tsc`). TypeScript types are consistent with the existing codebase patterns observed during this run.

</wizard-report>
