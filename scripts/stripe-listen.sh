#!/usr/bin/env bash
# Forward Stripe webhooks to the local AyurPass API.
# Requires Stripe CLI: https://stripe.com/docs/stripe-cli
set -euo pipefail

PORT="${PORT:-4000}"
TARGET="localhost:${PORT}/payments/webhook"

if ! command -v stripe >/dev/null 2>&1; then
  echo "Stripe CLI not found."
  echo "Install: brew install stripe/stripe-cli/stripe"
  echo "Then:    stripe login"
  exit 1
fi

echo "Forwarding Stripe events → http://${TARGET}"
echo ""
echo "Copy the webhook signing secret (whsec_…) into apps/api/.env as STRIPE_WEBHOOK_SECRET"
echo "Then restart the API (npm run dev:api)."
echo ""

exec stripe listen --forward-to "${TARGET}" --events payment_intent.succeeded,account.updated,charge.refunded,checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed,invoice.finalization_failed
