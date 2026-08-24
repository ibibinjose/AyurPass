-- Durable transactional communications and immutable payment receipts.
CREATE TYPE "CommunicationKind" AS ENUM (
  'BOOKING_CONFIRMATION',
  'PROVIDER_NEW_BOOKING',
  'BOOKING_REMINDER_24H',
  'BOOKING_REMINDER_2H',
  'PAYMENT_RECEIPT',
  'PROVIDER_PAYMENT_RECEIVED',
  'PAYMENT_REFUND',
  'PROVIDER_NEW_ENQUIRY'
);

CREATE TYPE "CommunicationChannel" AS ENUM ('EMAIL');

CREATE TYPE "CommunicationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED');

CREATE TYPE "ReceiptType" AS ENUM ('PAYMENT', 'REFUND');

CREATE TABLE "CommunicationDelivery" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "kind" "CommunicationKind" NOT NULL,
  "channel" "CommunicationChannel" NOT NULL DEFAULT 'EMAIL',
  "status" "CommunicationStatus" NOT NULL DEFAULT 'PENDING',
  "recipientEmail" TEXT NOT NULL,
  "recipientName" TEXT,
  "providerId" TEXT,
  "bookingId" TEXT,
  "orderId" TEXT,
  "receiptId" TEXT,
  "subject" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "scheduledFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedAt" TIMESTAMP(3),
  "lockedBy" TEXT,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunicationDelivery_idempotencyKey_key" ON "CommunicationDelivery"("idempotencyKey");
CREATE INDEX "CommunicationDelivery_status_scheduledFor_idx" ON "CommunicationDelivery"("status", "scheduledFor");
CREATE INDEX "CommunicationDelivery_bookingId_kind_idx" ON "CommunicationDelivery"("bookingId", "kind");
CREATE INDEX "CommunicationDelivery_providerId_createdAt_idx" ON "CommunicationDelivery"("providerId", "createdAt");
CREATE INDEX "CommunicationDelivery_recipientEmail_createdAt_idx" ON "CommunicationDelivery"("recipientEmail", "createdAt");

CREATE TABLE "Receipt" (
  "id" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "type" "ReceiptType" NOT NULL,
  "bookingId" TEXT,
  "orderId" TEXT,
  "providerId" TEXT NOT NULL,
  "recipientEmail" TEXT NOT NULL,
  "recipientName" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'AUD',
  "totalAmount" DECIMAL(10,2) NOT NULL,
  "taxAmount" DECIMAL(10,2),
  "taxRate" DECIMAL(5,4),
  "taxName" TEXT,
  "paymentIntentId" TEXT,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "snapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Receipt_number_key" ON "Receipt"("number");
CREATE UNIQUE INDEX "Receipt_bookingId_type_key" ON "Receipt"("bookingId", "type");
CREATE UNIQUE INDEX "Receipt_orderId_type_key" ON "Receipt"("orderId", "type");
CREATE INDEX "Receipt_providerId_issuedAt_idx" ON "Receipt"("providerId", "issuedAt");
CREATE INDEX "Receipt_recipientEmail_issuedAt_idx" ON "Receipt"("recipientEmail", "issuedAt");
