-- AlterEnum
ALTER TYPE "ProviderType" ADD VALUE 'NUTRITIONIST';

-- AlterEnum
ALTER TYPE "RetreatCategory" ADD VALUE 'NUTRITION_DETOX';

-- AlterEnum
ALTER TYPE "ServiceCategory" ADD VALUE 'NUTRITION';

-- AlterTable
ALTER TABLE "Consumer" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Professional" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discipline" TEXT,
    "discountLabel" TEXT,
    "code" TEXT,
    "imageUrl" TEXT,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offer_active_featured_idx" ON "Offer"("active", "featured");
