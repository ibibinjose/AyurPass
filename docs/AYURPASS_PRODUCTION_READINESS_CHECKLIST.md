# AyurPass Production Readiness Checklist

**Owner:** Product, Engineering, Operations, and Finance leads

**Use:** Complete the evidence column for every **P0** item before accepting live bookings, orders, provider subscriptions, or payouts.

**Scope:** Marketplace booking and order payments, provider Growth subscriptions, transactional email, vendor logos and addresses, receipts, and operating controls.

**Status convention:** `Not started`, `In progress`, `Ready`, `N/A with approval`, or `Blocked`.

> **Launch rule:** Do not enable live money movement merely because screens render successfully. A flow is ready only when its user-visible result, database state, webhook state, email/receipt, exception handling, and support procedure have all been demonstrated in a controlled test.

## 1. Launch Decision Gate

AyurPass has two distinct money flows. They must be configured and validated independently: **marketplace payments**, in which a seeker pays a provider for a booking or order, and **platform billing**, in which a provider pays AyurPass for its Growth plan. The existing activation guide makes this separation explicit.[1]

| Priority | Release gate | Accountable owner | Required evidence | Status |
|---|---|---|---|---|
| P0 | Production database is restored or replaced, migrations complete, backups tested, and `GET /health/ready` returns `200` with `status: ready`. | Engineering | Deployment record, migration output, backup-restore evidence, readiness screenshot or monitor link. | ☐ |
| P0 | The production web origin, API origin, CORS rules, and Stripe redirect URLs are exact and use HTTPS. | Engineering | Environment review signed by Engineering; successful hosted-checkout round trip. | ☐ |
| P0 | Secrets are held in a secrets manager, not source control, browser variables, CI logs, or support tickets. | Engineering / Security | Secret inventory and access review. | ☐ |
| P0 | At least one controlled test account completes each flow listed in Sections 3–6. | Product / QA | Test run ID, expected and actual outcomes, screenshots, and identifiers. | ☐ |
| P0 | A named on-call owner can investigate a failed payment, missing receipt, delayed email, payout delay, and provider dispute. | Operations | Escalation roster and runbook links. | ☐ |
| P0 | Cancellation, refund, tax, privacy, and support policies are published for the first launch jurisdiction before live paid traffic begins. | Business / Legal / Finance | Public URLs and written approval. | ☐ |
| P1 | Multi-market tax, localization, and payout policies are approved before expanding beyond the initial launch country. | Business / Finance | Jurisdiction matrix and launch approval. | ☐ |

**Go / no-go decision:** The release manager should record a single decision after all P0 rows are `Ready` or formally approved as `N/A`. A `Blocked` P0 row means **no live payment activation**.

## 2. Customer and Provider Screen Checklist

The purpose of these checks is to make every important state understandable to the person using the platform. A payment, a provider profile, or a receipt that only exists in the database is not a complete customer experience.

| Screen or journey | Required production behavior | Acceptance check | Evidence | Status |
|---|---|---|---|---|
| **Public provider page** | Shows the correct business name, provider logo/brand mark, cover image, contact path, and location context without exposing private data. | Test desktop and mobile layouts with a provider that has all media and one with no logo. Confirm accessible image alt text and no broken image URL. | Screenshot pair and URL. | ☐ |
| **Discover/search card** | Uses a safe logo fallback, accurate city/country, and never implies an unverified or incomplete address is a precise location. | Search for providers with full, partial, and missing addresses. Confirm cards do not leak street address where the business chose city-only visibility. | QA cases and screenshots. | ☐ |
| **Provider Dashboard → Business** | Lets an authorized provider owner save a business name, logo URL, cover image, street, city, state, postcode, and country; shows a clear success or failure state. | Save, refresh, edit, and clear the logo/cover. Confirm the public page and directory card update after cache expiry or invalidation. | Screen recording or test steps. | ☐ |
| **Provider Dashboard → Business** | Rejects malformed or unsafe media URLs and does not retain deleted branding values. | Attempt blank values, invalid URLs, overly long data, and a replacement logo. Confirm the saved profile matches the intended result. | API response and UI result. | ☐ |
| **Provider address settings** | Collects the minimum required address for the launch market, clearly distinguishes customer-visible location from legal/tax address, and supports later changes with auditability. | Verify required fields, format validation, country selection, and public rendering. Decide whether a home-based provider displays only city/suburb. | Approved address policy and test record. | ☐ |
| **Provider onboarding / Connect** | Does not represent a provider as ready to receive online payments until Stripe onboarding and required capabilities are complete. | Test incomplete, pending, and complete Connect account states. Confirm the dashboard explains the next action. | Stripe test-mode account IDs and screenshots. | ☐ |
| **Booking checkout** | Shows service, provider, appointment time and timezone, price, currency, tax treatment, cancellation terms, and the final amount before payment. | Execute card success, card failure, abandoned checkout, discount/gift card or points path if enabled, and browser refresh. | Test report and payment IDs. | ☐ |
| **Order checkout** | Shows item quantity, shipping or collection details where applicable, tax, final total, and refund policy before payment. | Complete the same success, failure, retry, and duplicate-submit tests as booking checkout. | Test report and order IDs. | ☐ |
| **Booking confirmation** | Displays a stable booking reference and the same essentials that appear in email: provider, service, time, timezone, and payment state. | Verify a user cannot access another customer’s booking by guessing an ID. | Authorization test and screenshot. | ☐ |
| **Customer account → bookings/orders** | Shows a payment state that is not falsely marked paid until payment confirmation or an authenticated webhook completes. | Simulate pending, paid, refunded, and failed states. | API/UI comparison. | ☐ |
| **Provider Dashboard → Payments / Plans** | Separates *AyurPass subscription billing* from money collected from customers. Shows plan, status, next period or trial end, and a clear “Manage billing” path. | Verify Free, trialing, active, past-due, cancellation-pending, canceled, and not-configured states. | State matrix screenshots. | ☐ |
| **Stripe hosted Checkout and portal** | Uses a provider-owner authenticated server request, short-lived Stripe URL, exact allowed return URL, and the platform billing account—not a connected provider account—for Growth subscriptions.[1] [4] | Complete subscription checkout, return, cancellation, payment-method update, invoice-history access, and reactivation in test mode. | Stripe session IDs and webhook log. | ☐ |
| **Support / error pages** | Give a non-sensitive next action when checkout, email, billing portal, or profile save fails. | Force errors with test configuration; confirm there are no secrets, stack traces, or payment details in the UI. | Screenshots and error log reference. | ☐ |

## 3. Vendor Logo and Address Requirements

A vendor logo and address serve different purposes. A **brand mark** supports discovery and recognition. A **public service location** helps customers decide where or whether a service is available. A **legal or tax address** supports invoicing, tax, and payment-provider verification. Do not assume that one saved address can safely serve all three roles.

| Data element | Required rule before launch | Display rule | Receipt / payment relevance | Status |
|---|---|---|---|---|
| Business name | Required, unique enough for customer recognition, and consistent with the provider’s payout/KYC identity where required. | Public on cards, profile, checkout, confirmations, and receipts. | Seller/provider identity. | ☐ |
| Logo / brand mark | Optional only if a high-quality platform fallback is used. Require a square, legible image and test both light and dark contexts. | Public cards, provider header, social preview where configured. | Not required on a statutory receipt, but desirable for branded communication. | ☐ |
| Cover image | Optional, but must have a safe fallback and clear removal behavior. | Provider profile and rich previews. | None. | ☐ |
| Public service address | Capture street, city, state/region, postcode, and country when relevant to in-person service. | Display only the precision approved by provider and policy; city-only is often appropriate for home-based businesses. | May support service-place and tax determination. | ☐ |
| Legal/tax address | Collect separately when the launch jurisdiction or payment provider requires it. | Do not display by default. | Required on invoices or tax documents where applicable. | ☐ |
| Payout/KYC address | Keep in Stripe/Connect or protected provider records with strict access controls. | Never public. | Supports payout and verification. | ☐ |
| Coordinates / map pin | Derive or validate from the public service address only with user consent and an accuracy policy. | Do not expose a private residence or precise appointment location by accident. | None. | ☐ |

**Decision required before launch:** Product, Operations, and Legal must define whether a provider can publish a city-only location, a full address, a service-area radius, or an appointment-specific address. The implementation and provider copy should follow that decision exactly.

## 4. Billing, Payment, Refund, and Payout Checklist

Stripe recommends treating webhooks as the source of asynchronous payment and subscription state, verifying the raw request and signature, and testing the handler before live launch.[3] AyurPass already separates marketplace settlement from Growth subscription state and records subscription updates from Stripe events.[1]

| Flow | Required controls | Minimum controlled test | Evidence | Status |
|---|---|---|---|---|
| Marketplace checkout | Authenticated payer ownership check, price calculated server-side, idempotency, clear pending state, and no card data handled by AyurPass. | Successful card payment and repeated submit/refresh do not double charge. | PaymentIntent, booking/order, webhook event, receipt ID. | ☐ |
| Counter payment | Provider/customer permissions, accurate payment-method record, staff accountability, and a payment reference where available. | Provider records cash/POS payment; customer receipt and provider notification occur once. | Booking ID, staff user, receipt ID. | ☐ |
| Booking/order refund | Party authorization, policy decision, Stripe refund state, product/booking status, and linked refund receipt. | Full and partial refund policy tests; webhook redelivery does not generate duplicate records. | Refund ID, original receipt, refund receipt. | ☐ |
| Stripe Connect onboarding | Correct provider country, requested capabilities, status refresh, and disabled checkout until requirements are complete. | Test account moves through incomplete → complete → restricted state. | Connected account ID and dashboard screenshots. | ☐ |
| Provider Growth checkout | Owner-only access, configured `price_` ID, verified account email, exact success/cancel URLs, and customer creation idempotency. | Provider starts and completes checkout twice; only one effective subscription/customer relationship results. | Checkout session, customer, subscription IDs. | ☐ |
| Provider billing portal | Portal supports the approved features: payment method, cancellation, invoice history, and permitted plan changes. | Change payment method, cancel at period end, reactivate if supported, and return to AyurPass. | Portal session and webhook record. | ☐ |
| Subscription entitlement | Provider access decisions rely on stored webhook-derived status, not the redirect alone. | Test `trialing`, `active`, `past_due`, `canceled`, `unpaid`, and incomplete status handling. | Entitlement-state test matrix. | ☐ |
| Payment failure and trial ending | A provider sees a clear billing state and receives a configured notification path. | Force `invoice.payment_failed` and a trial-ending event in test mode. Confirm no marketplace booking payment is altered. | Stripe event and UI/email evidence. | ☐ |
| Webhook security and reliability | HTTPS endpoint, raw-body signature verification, event deduplication, bounded retries, alerting for failures, and replay-safe processing. | Invalid signature is rejected; valid duplicate event does not duplicate a receipt, subscription change, or payment record. | Test output and monitoring link. | ☐ |
| Tax configuration | Tax-inclusive/exclusive display, tax registrations, provider responsibility, and tax calculation are approved for the launch jurisdiction. | Compare checkout, stored transaction, and receipt fields for a taxable and non-taxable test case. | Finance sign-off. | ☐ |
| Payout and reconciliation | Define payout timing, fees, reserves, negative balance/dispute handling, and a daily reconciliation routine. | Reconcile a test settlement from Stripe charge through provider amount and platform fee. | Reconciliation worksheet. | ☐ |

## 5. Transactional Email Checklist

AyurPass uses a durable, idempotent communication outbox: business events create a delivery record, a dispatcher sends it later, and failures retry independently of receipt persistence.[2] This protects against duplicate requests and webhook redelivery, but production delivery still depends on a configured sender domain, SMTP/SES credentials, a scheduler, and monitoring.

| Email | Recipient | Trigger and content requirements | Production acceptance check | Status |
|---|---|---|---|---|
| Email verification | Account holder | Clear verified sender, secure one-time link, expiry, and support path. | Delivered through production-configured sender; expired and reused links are safely handled. | ☐ |
| Password reset | Account holder | Secure expiring link, no account enumeration, and accessible plaintext alternative. | Request, delivery, completion, expiry, and invalid-token paths tested. | ☐ |
| Booking confirmation | Customer | Provider, service, date/time, timezone, booking reference, payment state, cancellation/reschedule path, and support contact. | Queue row becomes `SENT`; email content matches confirmation screen. | ☐ |
| New booking alert | Provider owner and authorised managers | Customer name, service, time, booking reference, and safe dashboard deep link. | Only intended recipients receive it; duplicate booking create does not send twice. | ☐ |
| 24-hour and 2-hour reminders | Customer | Correct timezone, appointment details, cancellation behavior, and no reminder after cancellation. | Scheduler timing verified; cancelled booking creates no reminder delivery. | ☐ |
| Payment receipt | Customer | See receipt field checklist in Section 6. | Receipt persists first; a temporary email failure does not remove the receipt. | ☐ |
| Provider payment-received alert | Provider owner and authorised managers | Payment amount, currency, service/order reference, receipt reference, and no unnecessary sensitive customer information. | Delivered once after a confirmed payment. | ☐ |
| Refund receipt | Customer | Original payment reference, refund amount, refund date/status, receipt number, and support/dispute path. | Stripe refund event creates one linked refund receipt and one notification. | ☐ |
| New enquiry alert | Provider owner and authorised managers | Contact details only as consented by the enquirer; safe link to the enquiry. | Recipient authorization and delivery are verified. | ☐ |
| Provider billing failure / trial ending | Provider owner | Amount or plan context, billing portal action, deadline, and support contact. | Confirmed in Stripe test mode. This may require an additional AyurPass communication template if not already enabled. | ☐ |
| Service cancellation / reschedule | Customer and affected provider staff | Original and new time, timezone, refund state, and action required. | Confirmed for provider- and customer-initiated paths. This may require additional templates if not already enabled. | ☐ |

### Email Platform Operations

| Control | Required condition | Evidence | Status |
|---|---|---|---|
| Sending domain | Production domain is verified; `SMTP_FROM` is an approved sender; SPF, DKIM, and DMARC are reviewed with the mail provider. | Provider console screenshot and DNS change record. | ☐ |
| Credentials | SMTP/SES credentials reside only in protected runtime secrets. | Secrets-manager policy review. | ☐ |
| Sandbox removal | SES sandbox restrictions are removed or every intended recipient is verified before launch. | SES account status. | ☐ |
| Dispatcher | EventBridge ECS task or one approved guarded scheduler path runs at the intended cadence; do not enable competing delivery paths without an operational reason.[2] | Scheduled-task configuration and a controlled delivery. | ☐ |
| Failure handling | Failed emails retry with bounded backoff and create a visible operations queue after exhaustion. | Controlled provider outage test and alert record. | ☐ |
| Observability | Delivery counts, retry count, `FAILED` records, bounces/complaints, and queue age have an owner and alert threshold. | Dashboard or query plus on-call rule. | ☐ |

## 6. Receipt and Invoice Field Checklist

A **receipt** records a completed payment or refund. An **invoice** is generally a billing request or a subscription accounting document. For AyurPass, customer booking/order receipts and provider Growth subscription invoices should stay distinct. Stripe’s customer portal can provide subscription invoice history when configured, while AyurPass must retain the marketplace payment and refund records that its customers and providers need.[4]

> **Important:** Receipt wording, tax fields, numbering, retention, and electronic-delivery rules depend on the seller, transaction type, and launch jurisdiction. Have qualified legal and accounting advisers approve the final template before live use. This checklist is operational guidance, not legal, tax, or accounting advice.

| Receipt field | Customer booking/order receipt | Refund receipt | Provider Growth subscription invoice | Acceptance rule | Status |
|---|---|---|---|---|---|
| Document label | `Payment receipt` | `Refund receipt` or credit/refund record | Stripe invoice / tax invoice as applicable | Label cannot imply an invoice when the document is only a receipt. | ☐ |
| Unique immutable number | Required | Required; linked to original payment | Stripe invoice number/ID | Number is unique, persisted, searchable, and never reused. | ☐ |
| Issue timestamp and timezone | Required | Required | Required | Clearly show issue date/time and use a consistent timezone policy. | ☐ |
| Seller/provider legal identity | Required where the provider is seller of record | Required | AyurPass legal entity | Store legal name and applicable business/tax identifiers in a durable snapshot. | ☐ |
| Seller legal/tax address | Required where jurisdiction or tax rules require it | Required where applicable | AyurPass billing address | Do not rely only on mutable public profile address. | ☐ |
| Customer identity | Name; email if delivered electronically | Name; email if delivered electronically | Provider billing customer | Include only the personal data necessary for the document and delivery. | ☐ |
| Service or item description | Required | Original service/item and refund reason or scope | Growth plan, interval, and period | Make line items understandable without access to the app. | ☐ |
| Service date / booking reference | Required for appointments | Original booking reference | Subscription period / invoice ID | Customer support can locate the source transaction quickly. | ☐ |
| Currency | Required | Required | Required | Use ISO currency code and consistent monetary formatting. | ☐ |
| Amount breakdown | Subtotal, discounts, tax, total paid | Amount refunded and remaining amount where partial | Stripe invoice subtotal, tax, total, amount paid/due | Amount math is exact and matches payment processor records. | ☐ |
| Tax details | Tax name, rate, amount, and inclusive/exclusive treatment where applicable | Reversed/refunded tax amount | Tax treatment where applicable | Approved by Finance for the launch jurisdiction. | ☐ |
| Payment method and reference | Processor, last four only if permitted, PaymentIntent/POS reference | Refund ID and original payment reference | Stripe customer/subscription/invoice reference | Never expose card secrets or full payment credentials. | ☐ |
| Status | Paid | Refunded / partially refunded | Paid, open, failed, void, etc. | Status comes from confirmed payment/webhook state. | ☐ |
| Provider/customer support route | Required | Required | Required | Provides a working support email or help URL and policy link. | ☐ |
| Retrieval and retention | Customer can retrieve as policy requires; operations can search it. | Linked to original receipt. | Available through Stripe portal and platform support records. | Retention and export process approved by Finance/Legal. | ☐ |

### Current AyurPass Receipt Validation

The current communications flow already creates an immutable receipt record with a unique receipt number, type, booking relationship, provider relationship, customer recipient, currency, total, tax values, payment reference, and snapshot before it queues the receipt email.[2] Before launch, verify that the snapshot also includes all legally required seller identity, legal-address, itemization, and retention fields for the first launch jurisdiction. The test must prove that a retry or redelivered webhook cannot create a second receipt for the same booking and receipt type.

## 7. End-to-End Production Test Matrix

A test is complete only if the screen outcome, API state, Stripe event, database record, receipt, and email outcome agree. Keep test data clearly marked and remove or refund it after the rehearsal.

| Test ID | Scenario | Required assertions | Owner | Status |
|---|---|---|---|---|
| E2E-01 | Provider saves logo and full public address | Dashboard save succeeds; profile/card renders expected media; only intended location precision is public. | QA | ☐ |
| E2E-02 | Provider clears logo or cover | Fallback renders; stale URL is not retained in API, cache, or public page. | QA | ☐ |
| E2E-03 | Customer completes booking with a card | One booking, one PaymentIntent, paid state, one receipt, customer confirmation, provider alert, and customer receipt. | QA / Finance | ☐ |
| E2E-04 | Customer retries after payment-page refresh | No duplicate charge, booking, receipt, or email. | QA | ☐ |
| E2E-05 | Counter payment | Authorization is correct; one payment record and one customer/provider communication set. | QA / Operations | ☐ |
| E2E-06 | Refund | Policy-approved refund updates payment state, creates one linked refund receipt, and notifies customer. | QA / Operations | ☐ |
| E2E-07 | Provider completes Growth checkout | Correct product/price, provider ownership check, active/trial state after webhook, entitlement updated. | QA / Finance | ☐ |
| E2E-08 | Provider opens billing portal | Authenticated owner gets a short-lived portal; payment method, cancellation, and invoice history follow approved portal settings. | QA | ☐ |
| E2E-09 | Renewal fails | Provider sees past-due state and action; marketplace booking/order payments remain unchanged. | QA / Operations | ☐ |
| E2E-10 | Stripe webhook replay and bad signature | Bad signature is rejected; valid duplicate is idempotent; operations can locate the event. | Engineering | ☐ |
| E2E-11 | Email-provider outage | Receipt remains issued; outbox retries; failure is visible after retry limit; recovery sends only one email. | Engineering / Operations | ☐ |
| E2E-12 | Booking cancellation before reminder | Future reminder is cancelled and is not delivered. | QA | ☐ |
| E2E-13 | Mobile browser and small-screen checkout | All booking, receipt, billing, and provider-profile states remain readable and actionable. | QA | ☐ |
| E2E-14 | Accessibility pass | Keyboard, focus order, labels, error messaging, contrast, and image alternatives meet the project’s accepted accessibility baseline. | QA | ☐ |

## 8. Monitoring, Reconciliation, and Incident Readiness

| Operational area | Production control | Escalate when | Evidence | Status |
|---|---|---|---|---|
| API and database | Readiness monitor, error rate, latency, migration/deployment health, backup alert. | Readiness fails, database unavailable, or error budget threshold exceeded. | Monitoring URL and alert test. | ☐ |
| Stripe webhooks | Delivery failures, signature rejects, duplicate-event handling, unprocessed backlog. | Any sustained failure or unprocessed event beyond the agreed threshold. | Stripe and application dashboards. | ☐ |
| Communications outbox | Pending age, retries, failed deliveries, sender bounce/complaint rate. | A receipt or confirmation exceeds the agreed delivery SLA, or failures accumulate. | Query/dashboard and on-call alert. | ☐ |
| Reconciliation | Daily comparison of Stripe charges/refunds/payouts with AyurPass payments, receipts, and provider settlement entries. | Difference cannot be explained by expected timing, refund, fee, or dispute state. | Signed daily reconciliation record. | ☐ |
| Support | Case categories for missing receipt, duplicate charge, payment failure, refund, provider verification, incorrect address, and email delivery. | Customer cannot self-serve or there is a financial/privacy risk. | Support macros and escalation guide. | ☐ |
| Security | Access review, least privilege, audit logs, incident contact, secrets rotation process, and no payment credentials in app logs. | Unauthorized access, leaked secret, suspicious payment event, or sensitive-data disclosure. | Security review. | ☐ |

## 9. Suggested Launch Sequence

| Stage | Action | Exit criterion |
|---|---|---|
| 1. Freeze | Freeze non-essential changes and record exact application, database, and infrastructure revisions. | Release candidate is reproducible. |
| 2. Restore | Confirm database health, migrations, backups, and API readiness before payment configuration. | `GET /health/ready` is healthy and written approval exists. |
| 3. Configure test mode | Set Stripe test keys, price, webhook secret, portal configuration, and SES/SMTP test sender. | All secrets load from protected runtime storage. |
| 4. Rehearse | Complete E2E-01 through E2E-14 in a production-like environment. | Every P0 test passes or has written approved exception. |
| 5. Review | Product, Engineering, Operations, Finance, and Legal review receipts, policies, support flow, and rollback. | Go/no-go sign-off is recorded. |
| 6. Promote | Replace all Stripe test-mode values with the paired live-mode values in one controlled deployment; activate approved dispatcher path. | Live configuration is verified without logging secrets. |
| 7. Controlled launch | Enable a limited provider cohort and monitor payments, webhook delivery, receipts, and email queue closely. | First controlled transactions reconcile correctly. |
| 8. Expand | Open to the wider audience only after the first-day review. | No unresolved P0 issue; operational metrics are within target. |

## 10. Sign-off Record

| Function | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product |  | ☐ Approve ☐ Block |  |  |
| Engineering |  | ☐ Approve ☐ Block |  |  |
| QA |  | ☐ Approve ☐ Block |  |  |
| Operations / Support |  | ☐ Approve ☐ Block |  |  |
| Finance |  | ☐ Approve ☐ Block |  |  |
| Legal / Privacy |  | ☐ Approve ☐ Block |  |  |
| Release manager |  | ☐ Go live ☐ No-go |  |  |

## References

[1]: https://github.com/ibibinjose/AyurPass/blob/main/docs/STRIPE_PRODUCTION_ACTIVATION.md "AyurPass Stripe Production Activation"
[2]: https://github.com/ibibinjose/AyurPass/blob/main/docs/TRANSACTIONAL_COMMUNICATIONS.md "AyurPass Transactional Communications"
[3]: https://docs.stripe.com/webhooks "Stripe: Receive Stripe events in your webhook endpoint"
[4]: https://docs.stripe.com/customer-management/integrate-customer-portal "Stripe: Integrate the customer portal with the API"
[5]: https://docs.stripe.com/billing/subscriptions/webhooks "Stripe: Using webhooks with subscriptions"
[6]: https://github.com/ibibinjose/AyurPass/blob/main/docs/GLOBAL-RELEASE-PLAYBOOK.md "AyurPass Global Release and Multi-Region Operations Playbook"
