-- Stripe Billing state for clinic Growth subscriptions.
CREATE TYPE "ClinicPlan" AS ENUM ('FREE', 'GROWTH');
CREATE TYPE "ClinicSubscriptionStatus" AS ENUM (
  'INACTIVE',
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'UNPAID',
  'CANCELLED',
  'INCOMPLETE',
  'INCOMPLETE_EXPIRED',
  'PAUSED'
);

CREATE TABLE "ClinicSubscription" (
  "id" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "stripeCustomerId" TEXT NOT NULL,
  "stripeSubscriptionId" TEXT,
  "stripePriceId" TEXT,
  "plan" "ClinicPlan" NOT NULL DEFAULT 'FREE',
  "status" "ClinicSubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "currentPeriodEnd" TIMESTAMP(3),
  "trialEnd" TIMESTAMP(3),
  "lastInvoiceId" TEXT,
  "lastInvoiceStatus" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClinicSubscription_providerId_key" ON "ClinicSubscription"("providerId");
CREATE UNIQUE INDEX "ClinicSubscription_stripeCustomerId_key" ON "ClinicSubscription"("stripeCustomerId");
CREATE UNIQUE INDEX "ClinicSubscription_stripeSubscriptionId_key" ON "ClinicSubscription"("stripeSubscriptionId");
CREATE UNIQUE INDEX "ClinicSubscription_lastInvoiceId_key" ON "ClinicSubscription"("lastInvoiceId");
CREATE INDEX "ClinicSubscription_plan_status_idx" ON "ClinicSubscription"("plan", "status");
CREATE INDEX "ClinicSubscription_stripeSubscriptionId_idx" ON "ClinicSubscription"("stripeSubscriptionId");

ALTER TABLE "ClinicSubscription"
  ADD CONSTRAINT "ClinicSubscription_providerId_fkey"
  FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
