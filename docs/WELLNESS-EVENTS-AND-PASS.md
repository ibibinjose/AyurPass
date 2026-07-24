# Wellness Events + Permanent Wellness Pass

## Product vision

AyurPass is not only a directory and booking engine — it is a **lifelong wellness identity**.

1. **Practices host events** across every discipline (including **Wellness Cooking Classes**).
2. **Seekers discover and join** events the same way they book sessions.
3. Every seeker holds a **permanent Wellness Pass** (Apple Wallet / Google Wallet ready).
4. **Appointments and event tickets attach to that pass** — one QR at the door or desk.

### Distinct from retreats

| | **Events** | **Retreats** |
|--|------------|--------------|
| Duration | Hours / half-day | Multi-day |
| Intent | Community, class, open day | Immersive programme |
| Check-in | Same-day QR via Pass | Enquiry / package |

## Data model

- `WellnessEvent` — hosted by `Provider`, categorised (`COOKING_CLASS`, `YOGA`, …)
- `EventTicket` — seeker registration, unique `checkInToken`, linked to `WellnessPass`
- `WellnessPass` — one per `Consumer`, serial `AP-XXXXXXX`, stable `publicToken`
- `Booking.wellnessPassId` + `checkInToken` — appointments on the same pass
- `PassScanLog` — audit when staff scan

## Wallet strategy

| Layer | Behaviour |
|-------|-----------|
| **Always on** | In-app / web digital pass with QR (`AYPASS:serial:token[:entitlement]`) |
| **Apple Wallet** | `pass.json` issued via `/wellness-pass/wallet/apple`; signed `.pkpass` when `APPLE_PASS_SIGNER_CERT` + Team ID + Pass Type ID are set |
| **Google Wallet** | Generic pass object via `/wellness-pass/wallet/google`; Save URL when `GOOGLE_WALLET_SERVICE_ACCOUNT` + issuer ID are set |

Configure later without schema changes:

```bash
APPLE_PASS_TYPE_ID=pass.com.ayurpass.wellness
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_PASS_SIGNER_CERT=...
GOOGLE_WALLET_ISSUER_ID=...
GOOGLE_WALLET_SERVICE_ACCOUNT=...
```

## Provider scan flow

1. Guest opens **Wellness Pass** (or ticket QR).
2. Staff open **Dashboard → Scan Pass**.
3. Scan/paste payload → API resolves:
   - full pass → identity + today’s entitlements at this venue
   - ticket token → event check-in
   - booking token → appointment check-in

## Categories

**Service:** `COOKING` (bookable cooking classes).  
**Provider type:** `WELLNESS_KITCHEN`.  
**Event:** `COOKING_CLASS` plus full wellness set (Ayurveda, Yoga, Sound healing, Open day, …).

## Key routes

| Surface | Path |
|---------|------|
| Public events | `/events`, `/events/[slug]` |
| Host events | `/dashboard/events` |
| My pass | `/dashboard/pass` |
| Scan desk | `/dashboard/scan` |
| API | `GET/POST /events`, `POST /events/:id/register`, `GET /wellness-pass/me`, `POST /wellness-pass/scan` |
