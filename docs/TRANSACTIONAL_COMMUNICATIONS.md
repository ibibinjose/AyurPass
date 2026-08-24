# Transactional Communications

AyurPass uses a database-backed transactional outbox for booking confirmations, provider booking and enquiry alerts, booking reminders, payment receipts, and refund receipts. Application requests and Stripe webhooks create an idempotent communication record first; a scheduled API dispatcher claims and delivers due records later. This prevents duplicate mail when a client retries a request, a webhook is redelivered, or multiple ECS tasks are running.

## Events implemented

| Event | Recipient | Delivery |
|---|---|---|
| Booking created | Customer | Booking confirmation email and two scheduled reminders |
| Booking created | Provider owner and managers | New booking email |
| Booking paid | Customer | Immutable payment receipt email |
| Booking paid | Provider owner and managers | Payment-received email |
| Booking refunded through Stripe webhook | Customer | Immutable refund receipt email |
| Public enquiry created | Provider owner and managers | New lead email |

Every receipt is retained as a database record with a unique receipt number and a snapshot of the booking, tax, payment reference, customer, provider, and amounts. Delivery status is separate from receipt issuance: a temporarily unavailable email provider does not erase the receipt or the business event.

## AWS production activation

Use Amazon SES SMTP in the API ECS task definition. Verify the sending domain and leave SES sandbox mode, or verify every intended recipient while sandbox mode is active. Store the SMTP username and password in AWS Secrets Manager and inject them into the task definition; do not commit credentials.

| Environment variable | Production value |
|---|---|
| `SMTP_HOST` | SES regional SMTP host, for example `email-smtp.ap-southeast-2.amazonaws.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` / `SMTP_PASS` | SES SMTP credentials from Secrets Manager |
| `SMTP_FROM` | A verified sender such as `AyurPass <noreply@ayurpass.com>` |
| `SMTP_SECURE` | `false` for STARTTLS on port 587 |
| `COMMUNICATIONS_DISPATCH_ENABLED` | `true`, only after an SES send test succeeds |

The preferred production dispatcher is an EventBridge-scheduled ECS task that runs the same API image with the command override `communications:dispatch` every five minutes. The container entrypoint recognizes this command, skips startup migrations, processes one bounded outbox batch, emits a structured CloudWatch summary, and exits. Configure the task with the same database and SES secrets as the API service.

`COMMUNICATIONS_DISPATCH_ENABLED=true` enables the guarded in-process five-minute scheduler as a temporary fallback only. Do not enable both paths unnecessarily. All workers use a conditional database claim, so a duplicate invocation cannot send the same event twice. A failed delivery is retried with bounded exponential backoff. After five failed attempts, the record is marked `FAILED` with a non-secret error message for operations follow-up.

## Release checks

First apply the Prisma migration. Then configure SES and the API ECS task secrets with dispatch disabled, deploy, and send a controlled booking/payment test. Confirm the outbox row is created and the email sender is valid. Create the EventBridge ECS scheduled task with command override `communications:dispatch`, using the same image revision and database/SES secrets as the API service. Trigger one controlled run and confirm a row transitions from `PENDING` to `SENT`. Use `COMMUNICATIONS_DISPATCH_ENABLED=true` only when the scheduled ECS task cannot yet be created.

Do not enable the dispatcher while the API database readiness endpoint is degraded. A healthy database is required for receipt persistence, idempotency, retries, and reminder delivery.
