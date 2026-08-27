# Stripe Production-Readiness Sources

## Official Stripe sources

1. [Receive Stripe events in your webhook endpoint](https://docs.stripe.com/webhooks)
   - Production webhook endpoints must be publicly reachable over HTTPS.
   - Handlers should verify the raw request body with the `Stripe-Signature` header and the endpoint signing secret.
   - Handlers should return a successful response quickly and move complex work to a durable follow-up path.
   - Stripe CLI can forward test events to a local endpoint for integration testing.

2. [Integrate the customer portal with the API](https://docs.stripe.com/customer-management/integrate-customer-portal)
   - Configure the customer portal separately for sandbox and live mode.
   - Create a short-lived portal session only for an authenticated customer and use a controlled return URL.
   - Configure the platform portal, not a connected account portal, when managing platform subscription billing in a Connect integration.
   - Use subscription and customer webhooks to synchronize entitlement, payment-method, and invoice changes.
   - Test the portal in sandbox before enabling live mode.

3. [Using webhooks with subscriptions](https://docs.stripe.com/billing/subscriptions/webhooks)
   - Subscription integrations require webhook handling because billing state changes asynchronously.
   - Test webhooks before live mode and respond appropriately to payment failures, cancellation, trial transitions, and invoice finalization failures.
   - Key events include `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`, `invoice.finalization_failed`, and `payment_intent.succeeded`.
   - Treat `past_due`, `unpaid`, and canceled states as explicit business decisions for customer notification and access control.

## AyurPass code and documentation alignment

- `docs/STRIPE_PRODUCTION_ACTIVATION.md` separates marketplace payments from clinic Growth subscriptions, requires a healthy database and `GET /health/ready` before live activation, lists the intended Stripe events, and restricts checkout/portal URLs to the configured frontend origin.
- `docs/TRANSACTIONAL_COMMUNICATIONS.md` specifies the database-backed outbox for confirmations, reminders, payment/refund receipts, and provider alerts; it uses idempotency, retries, and separate receipt persistence.
- `docs/GLOBAL-RELEASE-PLAYBOOK.md` describes multi-currency settlement, region-sensitive tax presentation, and the need to keep launch-market legal and tax configuration under explicit operational review.

These sources inform the production-readiness checklist. They are operational guidance only, not legal, tax, or accounting advice.
