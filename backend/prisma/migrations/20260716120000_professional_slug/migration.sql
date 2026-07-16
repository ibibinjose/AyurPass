-- Add public profile slug for /me/:slug practitioner pages
ALTER TABLE "Professional" ADD COLUMN "slug" TEXT;

CREATE UNIQUE INDEX "Professional_slug_key" ON "Professional"("slug");