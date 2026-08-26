#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

SKIP_SEED=false
START_APP=false

usage() {
  cat <<'EOF'
Usage: ./setup-local.sh [--skip-seed] [--start]

Options:
  --skip-seed  Apply migrations without loading deterministic local demo data.
  --start      Start the API and dashboard after local setup completes.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-seed)
      SKIP_SEED=true
      ;;
    --start)
      START_APP=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage >&2
      exit 1
      ;;
  esac
  shift
done

if [[ ! -f "package.json" || ! -d "apps/api" || ! -d "apps/dashboard" ]]; then
  echo "Error: run this script from the AyurPass monorepo root." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  cat >&2 <<'EOF'
Docker Compose is required to provision the repository's local PostGIS database.
Install Docker Desktop/Engine and Docker Compose, then run this command again.

If you intentionally use a manually managed PostgreSQL/PostGIS instance, update
apps/api/.env with its DATABASE_URL and run:
  npm run prisma:migrate
  npm run seed:local
  npm start
EOF
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  cat >&2 <<'EOF'
Docker is installed but its engine is not available. Start Docker Desktop or the
Docker service, then run this command again.
EOF
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

printf '%s\n' "5/5 Applying database migrations…"
if [[ "${CI:-}" == "true" || "${CI:-}" == "1" ]]; then
  npm run prisma:migrate:deploy
else
  npm run prisma:migrate
fi

if [[ "$SKIP_SEED" == "false" ]]; then
  printf '%s\n' "Seeding deterministic local demo data…"
  npm run seed:local
fi

if [[ "$START_APP" == "true" ]]; then
  cat <<'EOF'

Local setup is complete. Starting the API and dashboard…

  API:       http://localhost:4000
  Dashboard: http://localhost:3000

Press Ctrl+C to stop the API and dashboard. The local PostGIS container remains
running so subsequent starts are faster.
EOF
  exec npm start
fi

cat <<'EOF'

Local setup is complete.

  npm start              # API at http://localhost:4000 and dashboard at http://localhost:3000
  npm run dev:local      # Provision the local stack, then start API + dashboard
  npm run dev:mobile     # Expo mobile app
  npm run e2e:smoke      # Smoke-check a running local API and dashboard

To reset only the database service:
  docker compose down -v
  ./setup-local.sh

Use --skip-seed when you need an empty migrated database.
EOF
