#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

SKIP_SEED=false
if [[ "${1:-}" == "--skip-seed" ]]; then
  SKIP_SEED=true
elif [[ $# -gt 0 ]]; then
  echo "Usage: ./setup-local.sh [--skip-seed]" >&2
  exit 1
fi

if [[ ! -f "package.json" || ! -d "apps/api" || ! -d "apps/dashboard" ]]; then
  echo "Error: run this script from the AyurPass monorepo root." >&2
  exit 1
fi

printf '\n%s\n' "==================================="
printf '%s\n' "AyurPass local development setup"
printf '%s\n\n' "==================================="

printf '%s\n' "1/5 Installing locked workspace dependencies…"
npm ci

printf '%s\n' "2/5 Preparing local environment files…"
if [[ ! -f "apps/api/.env" ]]; then
  cp apps/api/.env.example apps/api/.env
  echo "   Created apps/api/.env"
fi
if [[ ! -f "apps/dashboard/.env.local" ]]; then
  cp apps/dashboard/.env.example apps/dashboard/.env.local
  echo "   Created apps/dashboard/.env.local"
fi
if [[ ! -f "apps/mobile/.env" ]]; then
  cp apps/mobile/.env.example apps/mobile/.env
  echo "   Created apps/mobile/.env"
fi

printf '%s\n' "3/5 Generating Prisma Client…"
npm run prisma:generate

printf '%s\n' "4/5 Ensuring the local PostGIS database is available…"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  docker compose up -d db
  for attempt in {1..30}; do
    if docker compose exec -T db pg_isready -U ayurpass -d ayurpass >/dev/null 2>&1; then
      break
    fi
    if [[ "$attempt" == "30" ]]; then
      echo "Error: the local PostGIS service did not become ready in time." >&2
      exit 1
    fi
    sleep 2
  done
else
  cat >&2 <<'EOF'
Docker Compose is required to provision the repository's local PostGIS database.
Install Docker Desktop/Engine and Docker Compose, then run this command again.

If you intentionally use a manually managed PostgreSQL/PostGIS instance, update
apps/api/.env with its DATABASE_URL and run:
  npm run prisma:migrate
  npm run seed:local
EOF
  exit 1
fi

printf '%s\n' "5/5 Applying database migrations…"
npm run prisma:migrate

if [[ "$SKIP_SEED" == "false" ]]; then
  printf '%s\n' "Seeding deterministic local demo data…"
  npm run seed:local
fi

cat <<'EOF'

Local setup is complete.

  npm start              # API at http://localhost:4000 and dashboard at http://localhost:3000
  npm run dev:mobile     # Expo mobile app
  npm run e2e:smoke      # Smoke-check a running local API and dashboard

To reset only the database service:
  docker compose down -v
  ./setup-local.sh

Use --skip-seed when you need an empty migrated database.
EOF
