-- Abuse reports & suggestions for trust & quality

CREATE TABLE IF NOT EXISTS "FeedbackReport" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "targetLabel" TEXT,
    "pageUrl" TEXT,
    "userId" TEXT,
    "contactEmail" TEXT,
    "contactName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FeedbackReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FeedbackReport_kind_status_idx" ON "FeedbackReport"("kind", "status");
CREATE INDEX IF NOT EXISTS "FeedbackReport_targetType_targetId_idx" ON "FeedbackReport"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "FeedbackReport_createdAt_idx" ON "FeedbackReport"("createdAt");
