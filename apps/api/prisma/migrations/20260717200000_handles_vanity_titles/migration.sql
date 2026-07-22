-- Namespaced professional handles, root vanity (admin-approved), structured titles.

-- Provider root vanity
ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "vanityHandle" TEXT;
ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "vanityStatus" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "vanityRequestedAt" TIMESTAMP(3);
ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "vanityReviewedAt" TIMESTAMP(3);
ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "vanityReviewNote" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Provider_vanityHandle_key" ON "Provider"("vanityHandle");

-- Professional handles + vanity + title kind
ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "handle" TEXT;
ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "handleNamespace" TEXT;
ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "vanityHandle" TEXT;
ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "vanityStatus" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "vanityRequestedAt" TIMESTAMP(3);
ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "vanityReviewedAt" TIMESTAMP(3);
ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "vanityReviewNote" TEXT;
ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "titleKind" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Professional_vanityHandle_key" ON "Professional"("vanityHandle");
CREATE UNIQUE INDEX IF NOT EXISTS "Professional_handleNamespace_handle_key" ON "Professional"("handleNamespace", "handle");
CREATE INDEX IF NOT EXISTS "Professional_handleNamespace_handle_idx" ON "Professional"("handleNamespace", "handle");
CREATE INDEX IF NOT EXISTS "Professional_vanityStatus_idx" ON "Professional"("vanityStatus");

-- Backfill: copy legacy slug into handle under "pro" when empty
UPDATE "Professional"
SET "handle" = "slug",
    "handleNamespace" = 'pro'
WHERE "slug" IS NOT NULL
  AND ("handle" IS NULL OR "handle" = '');
