#!/bin/bash
set -euo pipefail

echo "==================================="
echo "AyurPass Local Development Setup"
echo "==================================="

if [ ! -f "package.json" ] || [ ! -d "apps/api" ]; then
  echo "Error: run this script from the monorepo root (AyurPass/)."
  exit 1
fi

echo "1. Installing monorepo workspaces..."
npm install

echo "2. Env files..."
if [ ! -f "apps/api/.env" ]; then
  cp apps/api/.env.example apps/api/.env
  echo "   Created apps/api/.env — edit DATABASE_URL and JWT secrets."
fi
if [ ! -f "apps/dashboard/.env.local" ]; then
  cp apps/dashboard/.env.example apps/dashboard/.env.local
  echo "   Created apps/dashboard/.env.local"
fi

echo "3. Generating Prisma client..."
npm run prisma:generate

echo "4. Database migrations..."
if ! npm run prisma:migrate; then
  echo "Warning: migration failed. Ensure PostgreSQL is running and DATABASE_URL is set."
  echo "Docker example:"
  echo "  docker run --name ayurpass-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ayurpass_dev -p 5432:5432 -d postgres:15"
  exit 1
fi

echo ""
echo "Setup complete."
echo ""
echo "  npm start              # API :4000 + dashboard :3000"
echo "  npm run dev:api        # Nest watch"
echo "  npm run dev:dashboard  # Next.js"
echo "  npm run dev:mobile     # Expo"
echo ""
echo "See SETUP_LOCAL.md and README.md for details."
