#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "=== Starting AyurPass Backend Container ==="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set." >&2
  exit 1
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
