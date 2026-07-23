-- Job board tables (schema existed; production never received a migration)

CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'LOCUM', 'CASUAL');
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED', 'DRAFT');
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED');

CREATE TABLE "JobListing" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 7)),
    "providerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "locationType" TEXT NOT NULL DEFAULT 'on_site',
    "city" TEXT,
    "country" TEXT,
    "salaryMin" DECIMAL(10,2),
    "salaryMax" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "experienceYears" INTEGER,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "applicantUserId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "coverNote" TEXT,
    "resumeUrl" TEXT,
    "experienceYears" INTEGER,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobListing_code_key" ON "JobListing"("code");
CREATE INDEX "JobListing_providerId_status_idx" ON "JobListing"("providerId", "status");
CREATE INDEX "JobListing_category_status_idx" ON "JobListing"("category", "status");
CREATE INDEX "JobListing_createdAt_idx" ON "JobListing"("createdAt");

CREATE UNIQUE INDEX "JobApplication_jobId_applicantUserId_key" ON "JobApplication"("jobId", "applicantUserId");
CREATE INDEX "JobApplication_jobId_status_idx" ON "JobApplication"("jobId", "status");
CREATE INDEX "JobApplication_applicantUserId_idx" ON "JobApplication"("applicantUserId");

ALTER TABLE "JobListing" ADD CONSTRAINT "JobListing_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_applicantUserId_fkey" FOREIGN KEY ("applicantUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
