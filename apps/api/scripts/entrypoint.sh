#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "=== Starting AyurPass Backend Container ==="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set." >&2
  exit 1
fi

# A scheduled ECS task invokes this command to process due outbox records.
# Migrations belong to the controlled API deployment, not every short-lived worker.
if [ "${1:-}" = "communications:dispatch" ]; then
  echo "=== Dispatching AyurPass transactional communications ==="
  exec node dist/src/modules/communications/dispatch.js
fi

# A separately launched, confirmation-guarded ECS task uses these commands to
# prepare an empty launch database. It never starts the API or runs migrations.
if [ "${1:-}" = "data:reset:dry-run" ] || [ "${1:-}" = "data:reset:execute" ]; then
  echo "=== Running AyurPass fresh-launch data reset command ==="
  exec node scripts/reset-launch-data.mjs "$@"
fi

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting NestJS application..."
if [ -f dist/main.js ]; then
  exec node dist/main.js
elif [ -f dist/src/main.js ]; then
  exec node dist/src/main.js
else
  exec npm run start:prod
fi
