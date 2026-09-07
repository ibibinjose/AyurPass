-- Listing lifecycle: live | paused | closed (soft-close; no hard deletes)
ALTER TABLE "Provider"
  ADD COLUMN IF NOT EXISTS "listingStatus" TEXT NOT NULL DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS "statusChangedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "statusReason" TEXT,
  ADD COLUMN IF NOT EXISTS "statusChangedBy" TEXT;

ALTER TABLE "Professional"
  ADD COLUMN IF NOT EXISTS "listingStatus" TEXT NOT NULL DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS "statusChangedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "statusReason" TEXT,
  ADD COLUMN IF NOT EXISTS "statusChangedBy" TEXT;

ALTER TABLE "Service"
  ADD COLUMN IF NOT EXISTS "listingStatus" TEXT NOT NULL DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS "statusChangedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "statusReason" TEXT,
  ADD COLUMN IF NOT EXISTS "statusChangedBy" TEXT;

CREATE INDEX IF NOT EXISTS "Provider_listingStatus_idx" ON "Provider"("listingStatus");
CREATE INDEX IF NOT EXISTS "Professional_listingStatus_idx" ON "Professional"("listingStatus");
CREATE INDEX IF NOT EXISTS "Service_listingStatus_idx" ON "Service"("listingStatus");
