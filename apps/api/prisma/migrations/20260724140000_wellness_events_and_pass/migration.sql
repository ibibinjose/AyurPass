-- Wellness Cooking as bookable session category
ALTER TYPE "ServiceCategory" ADD VALUE IF NOT EXISTS 'COOKING';

-- Wellness kitchen as a practice type
ALTER TYPE "ProviderType" ADD VALUE IF NOT EXISTS 'WELLNESS_KITCHEN';

-- Event enums
DO $$ BEGIN
  CREATE TYPE "EventCategory" AS ENUM (
    'AYURVEDA', 'YOGA', 'SPA', 'MEDITATION', 'FITNESS', 'NUTRITION', 'COACHING',
    'COOKING_CLASS', 'SOUND_HEALING', 'COMMUNITY', 'WORKSHOP', 'OPEN_DAY',
    'RETREAT_PREVIEW', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TicketStatus" AS ENUM (
    'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'REFUNDED', 'NO_SHOW', 'WAITLISTED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Permanent Wellness Pass (one per seeker)
CREATE TABLE IF NOT EXISTS "WellnessPass" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL DEFAULT ('AP-' || upper(substr(md5(random()::text), 1, 7))),
    "publicToken" TEXT NOT NULL DEFAULT md5(random()::text || clock_timestamp()::text),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "holderName" TEXT,
    "applePassTypeId" TEXT,
    "appleSerial" TEXT,
    "googleObjectId" TEXT,
    "appleUpdatedAt" TIMESTAMP(3),
    "googleUpdatedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WellnessPass_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WellnessPass_consumerId_key" ON "WellnessPass"("consumerId");
CREATE UNIQUE INDEX IF NOT EXISTS "WellnessPass_serialNumber_key" ON "WellnessPass"("serialNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "WellnessPass_publicToken_key" ON "WellnessPass"("publicToken");
CREATE INDEX IF NOT EXISTS "WellnessPass_serialNumber_idx" ON "WellnessPass"("serialNumber");
CREATE INDEX IF NOT EXISTS "WellnessPass_publicToken_idx" ON "WellnessPass"("publicToken");

ALTER TABLE "WellnessPass" DROP CONSTRAINT IF EXISTS "WellnessPass_consumerId_fkey";
ALTER TABLE "WellnessPass" ADD CONSTRAINT "WellnessPass_consumerId_fkey"
  FOREIGN KEY ("consumerId") REFERENCES "Consumer"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- Wellness events
CREATE TABLE IF NOT EXISTS "WellnessEvent" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 7)),
    "slug" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "hostProfessionalId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "category" "EventCategory" NOT NULL,
    "tags" JSONB,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "meetingUrl" TEXT,
    "venueName" TEXT,
    "address" JSONB,
    "capacity" INTEGER,
    "waitlistEnabled" BOOLEAN NOT NULL DEFAULT true,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "images" JSONB,
    "coverImageUrl" TEXT,
    "whatToBring" JSONB,
    "inclusions" JSONB,
    "skillLevel" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WellnessEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WellnessEvent_code_key" ON "WellnessEvent"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "WellnessEvent_slug_key" ON "WellnessEvent"("slug");
CREATE INDEX IF NOT EXISTS "WellnessEvent_providerId_startTime_idx" ON "WellnessEvent"("providerId", "startTime");
CREATE INDEX IF NOT EXISTS "WellnessEvent_category_startTime_idx" ON "WellnessEvent"("category", "startTime");
CREATE INDEX IF NOT EXISTS "WellnessEvent_status_startTime_idx" ON "WellnessEvent"("status", "startTime");

ALTER TABLE "WellnessEvent" DROP CONSTRAINT IF EXISTS "WellnessEvent_providerId_fkey";
ALTER TABLE "WellnessEvent" ADD CONSTRAINT "WellnessEvent_providerId_fkey"
  FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Event tickets
CREATE TABLE IF NOT EXISTS "EventTicket" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 8)),
    "eventId" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "wellnessPassId" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'CONFIRMED',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "paymentIntentId" TEXT,
    "checkInToken" TEXT NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 12)),
    "checkedInAt" TIMESTAMP(3),
    "checkedInByUserId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventTicket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EventTicket_code_key" ON "EventTicket"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "EventTicket_checkInToken_key" ON "EventTicket"("checkInToken");
CREATE UNIQUE INDEX IF NOT EXISTS "EventTicket_eventId_consumerId_key" ON "EventTicket"("eventId", "consumerId");
CREATE INDEX IF NOT EXISTS "EventTicket_eventId_status_idx" ON "EventTicket"("eventId", "status");
CREATE INDEX IF NOT EXISTS "EventTicket_consumerId_idx" ON "EventTicket"("consumerId");
CREATE INDEX IF NOT EXISTS "EventTicket_wellnessPassId_idx" ON "EventTicket"("wellnessPassId");
CREATE INDEX IF NOT EXISTS "EventTicket_checkInToken_idx" ON "EventTicket"("checkInToken");

ALTER TABLE "EventTicket" DROP CONSTRAINT IF EXISTS "EventTicket_eventId_fkey";
ALTER TABLE "EventTicket" ADD CONSTRAINT "EventTicket_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "WellnessEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventTicket" DROP CONSTRAINT IF EXISTS "EventTicket_consumerId_fkey";
ALTER TABLE "EventTicket" ADD CONSTRAINT "EventTicket_consumerId_fkey"
  FOREIGN KEY ("consumerId") REFERENCES "Consumer"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventTicket" DROP CONSTRAINT IF EXISTS "EventTicket_wellnessPassId_fkey";
ALTER TABLE "EventTicket" ADD CONSTRAINT "EventTicket_wellnessPassId_fkey"
  FOREIGN KEY ("wellnessPassId") REFERENCES "WellnessPass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Link bookings to permanent pass + check-in
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "wellnessPassId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "checkInToken" TEXT DEFAULT upper(substr(md5(random()::text), 1, 12));
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "checkedInAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "checkedInByUserId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Booking_checkInToken_key" ON "Booking"("checkInToken");
CREATE INDEX IF NOT EXISTS "Booking_wellnessPassId_idx" ON "Booking"("wellnessPassId");
CREATE INDEX IF NOT EXISTS "Booking_checkInToken_idx" ON "Booking"("checkInToken");

ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_wellnessPassId_fkey";
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_wellnessPassId_fkey"
  FOREIGN KEY ("wellnessPassId") REFERENCES "WellnessPass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Scan audit log
CREATE TABLE IF NOT EXISTS "PassScanLog" (
    "id" TEXT NOT NULL,
    "wellnessPassId" TEXT,
    "providerId" TEXT,
    "scannedByUserId" TEXT,
    "targetKind" TEXT NOT NULL,
    "targetId" TEXT,
    "result" TEXT NOT NULL,
    "rawPayload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PassScanLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PassScanLog_wellnessPassId_createdAt_idx" ON "PassScanLog"("wellnessPassId", "createdAt");
CREATE INDEX IF NOT EXISTS "PassScanLog_providerId_createdAt_idx" ON "PassScanLog"("providerId", "createdAt");

ALTER TABLE "PassScanLog" DROP CONSTRAINT IF EXISTS "PassScanLog_wellnessPassId_fkey";
ALTER TABLE "PassScanLog" ADD CONSTRAINT "PassScanLog_wellnessPassId_fkey"
  FOREIGN KEY ("wellnessPassId") REFERENCES "WellnessPass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
