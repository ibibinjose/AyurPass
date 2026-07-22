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
