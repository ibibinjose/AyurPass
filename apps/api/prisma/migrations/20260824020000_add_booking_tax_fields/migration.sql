-- Keep the database Booking table aligned with the tax fields already used by
-- booking creation and selected by the generated Prisma client.
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "taxAmount" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "taxRate" DECIMAL(5,4),
  ADD COLUMN IF NOT EXISTS "taxName" TEXT,
  ADD COLUMN IF NOT EXISTS "taxExclusive" BOOLEAN DEFAULT false;
