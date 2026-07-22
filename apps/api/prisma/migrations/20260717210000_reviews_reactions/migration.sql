-- Quality control: star reviews + like/dislike reactions

ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "rating" DECIMAL(3,2) NOT NULL DEFAULT 0;
ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "likeCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "dislikeCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "likeCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "dislikeCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Review_userId_targetType_targetId_key"
  ON "Review"("userId", "targetType", "targetId");
CREATE INDEX IF NOT EXISTS "Review_targetType_targetId_status_idx"
  ON "Review"("targetType", "targetId", "status");
CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId");

CREATE TABLE IF NOT EXISTS "Reaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Reaction_userId_targetType_targetId_key"
  ON "Reaction"("userId", "targetType", "targetId");
CREATE INDEX IF NOT EXISTS "Reaction_targetType_targetId_value_idx"
  ON "Reaction"("targetType", "targetId", "value");
CREATE INDEX IF NOT EXISTS "Reaction_userId_idx" ON "Reaction"("userId");
