-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE_ONLINE', 'CASH', 'CARD_TERMINAL', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('ADJUSTMENT', 'SALE', 'RETURN', 'RESTOCK');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "posTransactionId" TEXT;

-- AlterTable
ALTER TABLE "Consumer" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "posTransactionId" TEXT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Professional" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "code" SET DEFAULT upper(substr(md5(random()::text), 1, 7));

-- CreateTable
CREATE TABLE "ProcessedWebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRecord" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "tags" TEXT[],
    "customFields" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientNote" (
    "id" TEXT NOT NULL,
    "clientRecordId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientRecord_providerId_consumerId_key" ON "ClientRecord"("providerId", "consumerId");

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRecord" ADD CONSTRAINT "ClientRecord_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRecord" ADD CONSTRAINT "ClientRecord_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "Consumer"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientNote" ADD CONSTRAINT "ClientNote_clientRecordId_fkey" FOREIGN KEY ("clientRecordId") REFERENCES "ClientRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
