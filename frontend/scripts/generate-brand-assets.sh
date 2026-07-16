#!/usr/bin/env bash
# Regenerate all brand PNGs from the master AyurPass logo (resize only — no redraw).
# Usage: ./scripts/generate-brand-assets.sh [path-to-source.png]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-$ROOT/public/brand/ayurpass-logo-source.png}"
BRAND="$ROOT/public/brand"
APP="$ROOT/src/app"
MOBILE="$ROOT/../mobile/assets"

if [[ ! -f "$SRC" ]]; then
  echo "Source image not found: $SRC" >&2
  exit 1
fi

mkdir -p "$BRAND" "$APP" "$MOBILE"

if [[ "$SRC" != *.png ]]; then
  sips -s format png "$SRC" --out "$BRAND/ayurpass-logo-source.png" >/dev/null
else
  cp "$SRC" "$BRAND/ayurpass-logo-source.png"
fi

cp "$BRAND/ayurpass-logo-source.png" "$BRAND/ayurpass-logo.png"
cp "$BRAND/ayurpass-logo.png" "$BRAND/ayurpass-logo-stacked.png"
cp "$BRAND/ayurpass-logo.png" "$BRAND/ayurpass-mark.png"

for size in 512 192 180 32; do
  sips -z "$size" "$size" "$BRAND/ayurpass-logo.png" --out "$BRAND/icon-${size}.png" >/dev/null
done

cp "$BRAND/icon-512.png" "$APP/icon.png"
cp "$BRAND/icon-180.png" "$APP/apple-icon.png"
cp "$BRAND/icon-512.png" "$ROOT/public/icon.png"
cp "$BRAND/icon-192.png" "$ROOT/public/icon-192.png"
cp "$BRAND/icon-180.png" "$ROOT/public/apple-icon.png"
cp "$BRAND/ayurpass-logo.png" "$ROOT/public/brand-mark.png"

for f in icon.png splash-icon.png adaptive-icon.png; do
  cp "$BRAND/icon-512.png" "$MOBILE/$f"
done
sips -z 48 48 "$BRAND/icon-512.png" --out "$MOBILE/favicon.png" >/dev/null

rm -rf "$ROOT/.next/cache"

echo "Brand assets generated. Bump BRAND_ASSET_VERSION in src/lib/brand.ts if the logo changed."