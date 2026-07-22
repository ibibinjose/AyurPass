-- Add public profile slug for /practice/:slug provider pages
ALTER TABLE "Provider" ADD COLUMN "slug" TEXT;

CREATE UNIQUE INDEX "Provider_slug_key" ON "Provider"("slug");