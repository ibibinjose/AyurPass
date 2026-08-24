# Stripe Production Activation

This guide activates two distinct Stripe capabilities without mixing their money flows:

| Capability           | Who pays                                      | Stripe product                                           |
| -------------------- | --------------------------------------------- | -------------------------------------------------------- |
| Marketplace payments | A seeker pays a clinic for a booking or order | Stripe Connect destination charges                       |
| Growth subscription  | A clinic pays AyurPass for its software plan  | Stripe Billing, hosted Checkout, and the customer portal |

> Do not activate either live flow until the production RDS replacement is healthy, migrations have completed, and `GET /health/ready` returns HTTP 200 with `status: ready`.

## 1. Configure Stripe in test mode first

Create an **AyurPass Growth** product in Stripe Billing with one recurring monthly AUD price at **A$369.00**. Copy the resulting `price_...` identifier. Configure the Stripe customer portal in test mode with cancellation, payment-method updates, invoice history, and the Growth product catalog enabled. Use the platform account for this portal, not a connected clinic account.

Create a test-mode webhook endpoint:

```text
https://api.ayurpass.com/payments/webhook
```

Subscribe it to these events:

```text
payment_intent.succeeded
account.updated
charge.refunded
charge.dispute.created
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
invoice.finalization_failed
```

Keep the signing secret private. The API verifies the raw request body and `stripe-signature` before it processes an event. Replayed handled events are deduplicated through `ProcessedWebhookEvent`.

## 2. Store configuration in AWS, never GitHub or source files

Create or update the ECS API task secrets using AWS Secrets Manager. Treat all values as secrets except the Price ID, which is still safest in protected task configuration.

| Name                       |       Required | Purpose                                                                                                             |
| -------------------------- | -------------: | ------------------------------------------------------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`        |            Yes | Platform Stripe secret key. Use `sk_test_...` first, then `sk_live_...`.                                            |
| `STRIPE_PUBLISHABLE_KEY`   |            Yes | Matching platform publishable key.                                                                                  |
| `STRIPE_WEBHOOK_SECRET`    |            Yes | Signing secret for the exact webhook endpoint and mode.                                                             |
| `STRIPE_GROWTH_PRICE_ID`   | Yes for Growth | Monthly Growth Price ID, beginning `price_`.                                                                        |
| `STRIPE_GROWTH_TRIAL_DAYS` |       Optional | Whole number from 1 to 90. Omit for no trial.                                                                       |
| `FRONTEND_URL`             |            Yes | Exact public origin, for example `https://ayurpass.com`. Checkout and portal returns are restricted to this origin. |

Do not place keys in `.env.example`, GitHub Actions logs, Amplify build logs, frontend `NEXT_PUBLIC_*` variables, or a message. Stripe Connect and Stripe Billing use the **same platform account keys**, but connected-account identifiers belong only to the marketplace-payment flow.

## 3. Deploy and validate in test mode

After RDS is ready, deploy the current API task revision and confirm all migrations—including `20260824040000_add_clinic_billing`—apply successfully. Validate the following sequence with a controlled clinic-owner test account and a Stripe test card:

1. Open **Dashboard → Payments** and confirm the platform setup sees configured keys.
2. Start Growth Checkout. Confirm it opens a Stripe-hosted subscription Checkout session and uses the configured Growth Price.
3. Complete checkout and confirm the `checkout.session.completed` and `customer.subscription.*` events create/update `ClinicSubscription` with `plan = GROWTH`.
4. Use **Manage billing**. Confirm the Stripe customer portal opens and returns only to the configured frontend origin.
5. Cancel or alter the subscription in the portal. Confirm the webhook updates `status`, `cancelAtPeriodEnd`, and the Provider's legacy `subscriptionTier`.
6. Trigger a failed renewal in test mode. Confirm `invoice.payment_failed` records `PAST_DUE` without affecting a booking or order payment record.
7. Run existing booking and Connect onboarding tests to prove marketplace payments remain independent.

The customer portal is Stripe's source of truth for cancellation, payment-method changes, and invoice history. The API records its webhook-derived subscription state for AyurPass entitlement decisions and auditability.

## 4. Promote to live mode only after the test checklist passes

Create the same Growth Product, Price, customer-portal configuration, and webhook endpoint in **live mode**. Live and test mode have separate Price IDs, portal configurations, and webhook signing secrets. Replace all four Stripe values together in the ECS task definition, then deploy once.

Before enabling paid Growth checkout, make the business's tax, invoicing, refund, cancellation, and trial policies available to clinics. Configure any tax handling in Stripe only after obtaining appropriate accounting advice for the operating jurisdictions.

## Event and entitlement behavior

| Stripe event                                | AyurPass action                                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `checkout.session.completed`                | Retrieves the Subscription and records the practice's Stripe customer/subscription identifiers. |
| `customer.subscription.created` / `updated` | Synchronizes Growth, trial, past-due, cancellation, and period-end state.                       |
| `customer.subscription.deleted`             | Sets plan to Free and records the terminal cancellation state.                                  |
| `invoice.paid`                              | Records invoice state while the subscription remains Stripe-derived.                            |
| `invoice.payment_failed`                    | Marks the clinic subscription past due; it never changes a seeker booking/order payment.        |
| `payment_intent.succeeded`                  | Continues to settle booking/order charges only.                                                 |

## Current launch blocker

The code and CI can be Stripe-ready, but live activation remains blocked until the RDS instance is replaced or restored and the API becomes healthy. Do not create a live webhook destination or accept live payments against a deployment that cannot persist webhook state.
