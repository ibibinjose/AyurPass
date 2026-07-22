-- CreateEnum
CREATE TYPE "RetreatCategory" AS ENUM ('YOGA_RETREAT', 'YOGA_TEACHER_TRAINING', 'MEDITATION_RETREAT', 'AYURVEDA_PANCHAKARMA', 'DETOX_CLEANSE', 'SPA_WELLNESS', 'FITNESS_ADVENTURE', 'SILENT_RETREAT', 'WOMENS_RETREAT', 'HEALING_RETREAT');

-- AlterTable
ALTER TABLE "Consumer" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "retreatId" TEXT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Professional" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- CreateTable
CREATE TABLE "Retreat" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "RetreatCategory" NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "city" TEXT,
    "country" TEXT,
    "address" JSONB,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "durationDays" INTEGER,
    "priceFrom" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "capacity" INTEGER,
    "skillLevel" TEXT,
    "images" JSONB,
    "highlights" JSONB,
    "inclusions" JSONB,
    "externalBookingUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Retreat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Retreat_slug_key" ON "Retreat"("slug");

-- CreateIndex
CREATE INDEX "Retreat_category_startDate_idx" ON "Retreat"("category", "startDate");

-- CreateIndex
CREATE INDEX "Retreat_featured_idx" ON "Retreat"("featured");

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_retreatId_fkey" FOREIGN KEY ("retreatId") REFERENCES "Retreat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retreat" ADD CONSTRAINT "Retreat_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
