-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('OWNER', 'MANAGER', 'RECEPTIONIST', 'PRACTITIONER');

-- CreateEnum
CREATE TYPE "StaffInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED');

-- CreateTable
CREATE TABLE "ProviderStaff" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT,
    "role" "StaffRole" NOT NULL DEFAULT 'RECEPTIONIST',
    "permissions" JSONB,
    "inviteEmail" TEXT,
    "displayName" TEXT,
    "inviteStatus" "StaffInviteStatus" NOT NULL DEFAULT 'PENDING',
    "inviteToken" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderStaff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProviderStaff_inviteToken_key" ON "ProviderStaff"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderStaff_providerId_userId_key" ON "ProviderStaff"("providerId", "userId");

-- CreateIndex
CREATE INDEX "ProviderStaff_inviteEmail_idx" ON "ProviderStaff"("inviteEmail");

-- CreateIndex
CREATE INDEX "ProviderStaff_providerId_role_idx" ON "ProviderStaff"("providerId", "role");

-- AddForeignKey
ALTER TABLE "ProviderStaff" ADD CONSTRAINT "ProviderStaff_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderStaff" ADD CONSTRAINT "ProviderStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
