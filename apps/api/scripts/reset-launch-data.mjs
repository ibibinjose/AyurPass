import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

const DATABASE_CONFIRMATION = "DELETE_ALL_AYURPASS_DATA";
const MEDIA_CONFIRMATION = "DELETE_ALL_AYURPASS_MEDIA";
const PRESERVED_TABLES = new Set(["_prisma_migrations", "spatial_ref_sys"]);

const mode = process.argv[2];
const purgeMedia = process.argv.includes("--purge-media");

if (!["data:reset:dry-run", "data:reset:execute"].includes(mode)) {
  console.error(
    "Usage: node scripts/reset-launch-data.mjs <data:reset:dry-run|data:reset:execute> [--purge-media]",
  );
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be configured.");
  process.exit(1);
}

const execute = mode === "data:reset:execute";
if (
  execute &&
  process.env.AYURPASS_DATA_RESET_CONFIRMATION !== DATABASE_CONFIRMATION
) {
  console.error(
    `Refusing destructive reset: set AYURPASS_DATA_RESET_CONFIRMATION=${DATABASE_CONFIRMATION}.`,
  );
  process.exit(1);
}

if (
  execute &&
  purgeMedia &&
  process.env.AYURPASS_MEDIA_RESET_CONFIRMATION !== MEDIA_CONFIRMATION
) {
  console.error(
    `Refusing media deletion: set AYURPASS_MEDIA_RESET_CONFIRMATION=${MEDIA_CONFIRMATION}.`,
  );
  process.exit(1);
}

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function listApplicationTables(prisma) {
  const rows = await prisma.$queryRaw`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename ASC
  `;

  return rows
    .map((row) => row.tablename)
    .filter((tableName) => !PRESERVED_TABLES.has(tableName));
}

async function countMediaObjects(client, bucket) {
  let continuationToken;
  let count = 0;

  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: "media/",
        ContinuationToken: continuationToken,
      }),
    );
    count += page.Contents?.length ?? 0;
    continuationToken = page.IsTruncated
      ? page.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return count;
}

async function deleteMediaObjects(client, bucket) {
  let continuationToken;
  let deleted = 0;

  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: "media/",
        ContinuationToken: continuationToken,
      }),
    );
    const objects = (page.Contents ?? [])
      .map(({ Key }) => Key)
      .filter(Boolean)
      .map((Key) => ({ Key }));

    if (objects.length > 0) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: objects, Quiet: true },
        }),
      );
      deleted += objects.length;
    }

    continuationToken = page.IsTruncated
      ? page.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return deleted;
}

async function main() {
  const prisma = new PrismaClient();

  try {
    const tables = await listApplicationTables(prisma);
    if (tables.length === 0) {
      throw new Error(
        "No application tables were found in the public schema. Apply migrations before running this command.",
      );
    }

    const bucket = process.env.S3_MEDIA_BUCKET?.trim();
    const s3 = bucket
      ? new S3Client({ region: process.env.AWS_REGION || "ap-southeast-2" })
      : null;

    console.log(
      `Mode: ${execute ? "EXECUTE (destructive)" : "DRY RUN (read-only)"}`,
    );
    console.log(`Application tables targeted: ${tables.length}`);
    console.log(tables.join(", "));
    console.log("Preserved tables: _prisma_migrations, spatial_ref_sys");

    if (s3 && bucket) {
      const mediaCount = await countMediaObjects(s3, bucket);
      console.log(
        `Application media under s3://${bucket}/media/: ${mediaCount} object(s)`,
      );
      if (purgeMedia && !execute) {
        console.log(
          "Media would be deleted because --purge-media was requested.",
        );
      }
    } else {
      console.log(
        "S3_MEDIA_BUCKET is not configured; no media-object action is available.",
      );
    }

    if (!execute) {
      console.log("No data was changed.");
      return;
    }

    const qualifiedTables = tables
      .map((table) => `public.${quoteIdentifier(table)}`)
      .join(", ");
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${qualifiedTables} RESTART IDENTITY CASCADE`,
    );
    console.log(
      `Deleted all rows from ${tables.length} application table(s) and reset identities.`,
    );

    if (purgeMedia && s3 && bucket) {
      const deleted = await deleteMediaObjects(s3, bucket);
      console.log(
        `Deleted ${deleted} application media object(s) from s3://${bucket}/media/.`,
      );
    }

    console.log("Fresh launch reset completed. No seed data was created.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Fresh launch reset failed:", error);
  process.exit(1);
});
