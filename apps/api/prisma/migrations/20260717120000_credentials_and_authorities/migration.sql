-- Business & practitioner credentials + local health-authority approval marks

ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT;
ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "licenceNumber" TEXT;
ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "healthAuthorities" JSONB;

ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT;
ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "licenceNumber" TEXT;
ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "healthAuthorities" JSONB;
