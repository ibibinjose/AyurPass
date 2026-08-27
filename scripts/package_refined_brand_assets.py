from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DASHBOARD = ROOT / "apps" / "dashboard"
BRAND = DASHBOARD / "public" / "brand"
MOBILE = ROOT / "apps" / "mobile" / "assets"
SOURCE = BRAND / "ayurpass-mark-refined.png"

if not SOURCE.exists():
    raise FileNotFoundError(f"Refined brand source is missing: {SOURCE}")

image = Image.open(SOURCE).convert("RGB")

# Master assets used by the web logo, structured-data image, and verified mark.
for filename in (
    "ayurpass-logo-source.png",
    "ayurpass-logo.png",
    "ayurpass-logo-stacked.png",
    "ayurpass-mark.png",
):
    image.save(BRAND / filename, "PNG", optimize=True)

# Platform-specific sizes. These are deliberately exported from the same refined master.
for size in (512, 192, 180, 32):
    target = image.resize((size, size), Image.Resampling.LANCZOS)
    target.save(BRAND / f"icon-{size}.png", "PNG", optimize=True)

for target_path, size in (
    (DASHBOARD / "src" / "app" / "icon.png", 512),
    (DASHBOARD / "src" / "app" / "apple-icon.png", 180),
    (DASHBOARD / "public" / "icon.png", 512),
    (DASHBOARD / "public" / "icon-192.png", 192),
    (DASHBOARD / "public" / "apple-icon.png", 180),
    (DASHBOARD / "public" / "brand-mark.png", 512),
    (MOBILE / "icon.png", 512),
    (MOBILE / "splash-icon.png", 512),
    (MOBILE / "adaptive-icon.png", 512),
    (MOBILE / "favicon.png", 48),
):
    target_path.parent.mkdir(parents=True, exist_ok=True)
    image.resize((size, size), Image.Resampling.LANCZOS).save(target_path, "PNG", optimize=True)

print("Refined AyurPass brand assets packaged successfully.")
