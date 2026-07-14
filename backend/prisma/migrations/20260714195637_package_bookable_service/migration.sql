-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "serviceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Package_serviceId_key" ON "Package"("serviceId");

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

