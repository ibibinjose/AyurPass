/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Consumer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Professional` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ProviderType" ADD VALUE 'COACHING';

-- AlterEnum
ALTER TYPE "ServiceCategory" ADD VALUE 'COACHING';

-- AlterTable
ALTER TABLE "Consumer" ADD COLUMN     "code" TEXT NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "code" TEXT NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Professional" ADD COLUMN     "code" TEXT NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "code" TEXT NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 7));

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "code" TEXT NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 7)),
ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Consumer_code_key" ON "Consumer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Professional_code_key" ON "Professional"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_code_key" ON "Provider"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Service_code_key" ON "Service"("code");
