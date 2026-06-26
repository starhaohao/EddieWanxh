"""
Rename product photos for Shopify image links.

Run from terminal:
  cd "/Volumes/Ed's Snoopy/01 TRIIIPLE STUDIO/"
  python3 rename_for_shopify.py

Or point to the folder:
  python3 rename_for_shopify.py --root "/Volumes/Ed's Snoopy/01 TRIIIPLE STUDIO/"

Dry-run first (no actual renaming):
  python3 rename_for_shopify.py --dry-run

Install dependency first:
  pip3 install pillow
"""

import os
import argparse
from pathlib import Path
from PIL import Image
import shutil

# --- SKU folder → product slug ---
FOLDER_MAP = {
    "TSU1001": "v-cotton-spandex-brief",
    "TSU1002": "w-cotton-spandex-boxer-trunk",
    "TSU1003": "y-transdry-brief",
    "TSU1004": "h-cotton-spandex-boxer-trunk",
    "TSU1005": "x-transdry-brief",
    "TSU1007": "x-transdry-boxer-trunk",
    "TSE1001": "l-cotton-spandex-socks",
    "TST1002": "ed-cotton-spandex-tshirt",
    "TST1003": "ed-cotton-spandex-sleeveless",
    # TST1001 is discontinued — skipped
}

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}


def detect_background(image_path: Path) -> str:
    """
    Check corner pixels to detect background type.
    Returns: 'white-bg', 'black-bg', or 'lifestyle'
    """
    try:
        img = Image.open(image_path).convert("RGB")
        w, h = img.size
        sample_size = max(1, min(w, h) // 20)  # 5% of shortest dimension

        # Sample 4 corners
        corners = [
            img.crop((0, 0, sample_size, sample_size)),
            img.crop((w - sample_size, 0, w, sample_size)),
            img.crop((0, h - sample_size, sample_size, h)),
            img.crop((w - sample_size, h - sample_size, w, h)),
        ]

        corner_avgs = []
        for region in corners:
            pixels = list(region.getdata())
            r = sum(p[0] for p in pixels) / len(pixels)
            g = sum(p[1] for p in pixels) / len(pixels)
            b = sum(p[2] for p in pixels) / len(pixels)
            corner_avgs.append((r, g, b))

        overall_r = sum(c[0] for c in corner_avgs) / 4
        overall_g = sum(c[1] for c in corner_avgs) / 4
        overall_b = sum(c[2] for c in corner_avgs) / 4
        brightness = (overall_r + overall_g + overall_b) / 3

        if brightness > 220:
            return "white-bg"
        elif brightness < 35:
            return "black-bg"
        else:
            return "lifestyle"
    except Exception as e:
        print(f"  [warn] Could not analyse background for {image_path.name}: {e}")
        return "lifestyle"


def get_color_from_filename(filename: str) -> str | None:
    """
    Guess garment color from original filename if present.
    Returns lowercase color string or None.
    """
    name = filename.lower()
    color_keywords = {
        "white": "white",
        "wht": "white",
        "black": "black",
        "blk": "black",
        "navy": "navy",
        "heather": "heather-grey",
        "grey": "heather-grey",
        "gray": "heather-grey",
        "dusty": "dusty-blue",
        "blue": "dusty-blue",
        "pink": "pink",
    }
    for kw, color in color_keywords.items():
        if kw in name:
            return color
    return None


def build_new_name(sku: str, product_slug: str, garment_color: str | None,
                   bg: str, view: str, n: int, ext: str) -> str:
    """
    Format: {sku}-{garment-color}-{view}-{batch}-{n}.jpg
    batch = 'studio' for new batch (pure bg), 'lifestyle' for old batch
    """
    color_part = f"-{garment_color}" if garment_color else ""
    batch = "studio" if bg in ("white-bg", "black-bg") else "lifestyle"
    return f"{sku.lower()}{color_part}-{view}-{batch}-{n}{ext.lower()}"


def process_folder(folder: Path, sku: str, product_slug: str, dry_run: bool):
    image_files = sorted([
        f for f in folder.iterdir()
        if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS
    ], key=lambda f: f.stat().st_birthtime if hasattr(f.stat(), "st_birthtime") else f.stat().st_mtime)

    if not image_files:
        print(f"  [skip] No images found in {folder.name}")
        return

    counters: dict[str, int] = {}  # key = (color, view, batch) → counter

    for img_path in image_files:
        bg = detect_background(img_path)
        garment_color = get_color_from_filename(img_path.stem)

        # Guess view from filename
        name_lower = img_path.stem.lower()
        if any(k in name_lower for k in ["back", "rear", "_b", "-b-"]):
            view = "back"
        elif any(k in name_lower for k in ["detail", "zoom", "close", "fabric"]):
            view = "detail"
        elif any(k in name_lower for k in ["lifestyle", "model", "worn"]):
            view = "lifestyle"
        else:
            view = "front"

        key = (garment_color or "unknown", view, bg)
        counters[key] = counters.get(key, 0) + 1
        n = counters[key]

        new_name = build_new_name(sku, product_slug, garment_color, bg, view, n, img_path.suffix)
        new_path = folder / new_name

        batch_label = "NEW (studio)" if bg in ("white-bg", "black-bg") else "OLD (lifestyle)"
        print(f"  [{batch_label}]  {img_path.name}  →  {new_name}")

        if not dry_run:
            if new_path.exists() and new_path != img_path:
                print(f"    [warn] {new_name} already exists, skipping")
                continue
            img_path.rename(new_path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="Root folder containing SKU subfolders")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, do not rename")
    args = parser.parse_args()

    root = Path(args.root)
    mode = "DRY RUN — no files will be changed" if args.dry_run else "LIVE — files will be renamed"
    print(f"\n{'='*60}")
    print(f"Shopify Image Renamer — {mode}")
    print(f"Root: {root.resolve()}")
    print(f"{'='*60}\n")

    for folder_name, product_slug in FOLDER_MAP.items():
        folder = root / folder_name
        if not folder.exists():
            print(f"[skip] {folder_name} — folder not found")
            continue
        print(f"\n[{folder_name}] {product_slug}")
        process_folder(folder, folder_name, product_slug, dry_run=args.dry_run)

    print("\nDone.")
    if args.dry_run:
        print("Run without --dry-run to apply the changes.")


if __name__ == "__main__":
    main()
