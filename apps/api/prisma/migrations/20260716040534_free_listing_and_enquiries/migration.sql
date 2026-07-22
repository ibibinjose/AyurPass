-- AlterTable
ALTER TABLE "Consumer" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Professional" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "listingTier" TEXT NOT NULL DEFAULT 'BOOKING',
ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Enquiry_providerId_createdAt_idx" ON "Enquiry"("providerId", "createdAt");

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
