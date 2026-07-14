# AyurPass – System Integrations

## a) Stripe Connect – Dynamic Split Payments

**Provider Onboarding**
- Stripe Connect OAuth flow + KYC

**Booking Flow (Node.js backend)**
1. Create PaymentIntent on platform account with `application_fee_amount`
2. Use Destination Charges or Separate Charges + Transfers
3. On success → automatic transfer to provider’s connected account

**Webhooks**
- `payment_intent.succeeded`
- Refunds and disputes
- Real-time payout status visible in provider dashboard

## b) Twilio Programmable Video – Secure Telehealth

**Architecture**
- Backend generates short-lived access tokens (identity, room name, grants)
- Rooms created per consultation (`booking_id`)
- HIPAA-compliant via Twilio BAA + end-to-end encryption

**Features**
- Waiting room
- Screen sharing (dosha charts)
- Recording (with consent + encrypted S3 storage)
- Participant controls

**Client**: React Native + Twilio Video SDK
**Backend**: Manages session lifecycle + post-call notes sync to health profile

## c) Google Calendar API – Two-Way Real-Time Sync

**Professional Connection**
- OAuth2 connection to Google account

**Push (Webhooks)**
- Subscribe to calendar changes → immediately update `availability_slots`

**Pull (Incremental Sync)**
- Use `syncToken` for efficient polling (hourly background job)

**Two-Way Logic**
- AyurPass booking confirmed → Create Google Calendar event (with metadata for deduplication)
- External Google change → Update AyurPass availability (respect business rules)

**Deduplication**: Store `external_event_id` + source on events
**Source of Truth**: AyurPass for paid bookings

**Security**: Encrypted token storage, rate limiting, comprehensive logging.

---

*Source: AyurPass Blueprint – System Integrations section*