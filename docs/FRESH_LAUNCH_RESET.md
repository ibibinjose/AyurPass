# Fresh Launch Reset Runbook

## Purpose

This runbook prepares AyurPass for a **deliberately empty launch**. The reset removes all rows from application tables in the PostgreSQL `public` schema while preserving Prisma migration history. It does **not** seed replacement users, providers, services, products, bookings, payments, receipts, notifications, or other demo content.

The command is intended for the initial launch only. It is destructive and must never be scheduled or added to a normal API deployment.

> The current production RDS instance must first be recovered or restored. The production reset command cannot operate while the database is in the `inaccessible-encryption-credentials` state.

## Scope

| Store                                           | Reset behavior                                                                                                                         |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| PostgreSQL application tables                   | All rows are removed with `TRUNCATE ... RESTART IDENTITY CASCADE`.                                                                     |
| Prisma migration history                        | Preserved through `_prisma_migrations`, so `prisma migrate deploy` remains safe and idempotent.                                        |
| PostGIS system metadata                         | `spatial_ref_sys` is preserved.                                                                                                        |
| S3 application media                            | Optional; only objects under the dedicated `media/` prefix are deleted with `--purge-media`.                                           |
| Stripe, SES, CloudWatch, ECR, backups, and logs | Not deleted by this application reset. Retain or manage them separately under the applicable retention, financial, and audit policies. |

## Preconditions

The database restoration must be complete and the API migration deployment must have succeeded. Before using the destructive mode, take and retain a final encrypted RDS snapshot. Confirm that the target database, S3 bucket, and AWS account are the intended production resources.

Use a dedicated ECS one-shot task based on the same API task definition, image, subnets, security groups, database secret, and IAM role as the API. Override its command with one of the commands below. Do not configure this task with a scheduled EventBridge rule.

## Step 1: Read-only dry run

Run a one-shot ECS task with the command override:

```text
data:reset:dry-run
```

The task lists the PostgreSQL application tables that would be truncated and, if `S3_MEDIA_BUCKET` is configured, counts objects under `media/`. It does not change data.

Review the CloudWatch output. The expected result is a clear list of targeted tables and a `No data was changed.` message.

## Step 2: Explicitly approve the database reset

Set this task-only environment variable for the one-shot execution:

```text
AYURPASS_DATA_RESET_CONFIRMATION=DELETE_ALL_AYURPASS_DATA
```

Run the command override:

```text
data:reset:execute
```

The task truncates every application table in `public`, resets database identities, preserves the migration and PostGIS system tables, then exits. No seed script is invoked.

## Step 3: Optionally purge application media

Only if the configured `S3_MEDIA_BUCKET` is dedicated to AyurPass uploads and you also want uploaded files removed, add both the command flag and a second task-only confirmation variable:

```text
Command: data:reset:execute --purge-media
AYURPASS_DATA_RESET_CONFIRMATION=DELETE_ALL_AYURPASS_DATA
AYURPASS_MEDIA_RESET_CONFIRMATION=DELETE_ALL_AYURPASS_MEDIA
```

The reset script deletes only objects under `media/`; it never deletes an entire bucket. Ensure the task role has `s3:ListBucket` limited to the bucket and `s3:DeleteObject` limited to its `media/*` prefix.

## Step 4: Verify the empty baseline

After the reset task succeeds, start or redeploy the normal API service with `COMMUNICATIONS_DISPATCH_ENABLED=false`. Verify the readiness endpoint and use the API/dashboard public discovery paths to confirm no demo provider, service, booking, product, receipt, or communication rows are returned.

Do not run `npm run seed:local`, `seed:aaa`, or other import scripts against production. The existing `seed:local` script independently refuses remote/production-looking database URLs, but it remains available for local developer environments and CI fixtures only.

## Recovery note

If the reset is run against the wrong database, restore the final snapshot taken before Step 2. Treat the confirmation values as one-shot values; remove them from the ECS task override immediately after the completed task.
