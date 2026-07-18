"""Local-only helper — not run by CI. Requires scripts/requirements-portrait.txt.

Usage: python scripts/prep_photo.py your-photo.jpg
"""
import argparse
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from rembg import remove

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = ROOT / "assets" / "avatar-prepped.png"


def remove_background(img: Image.Image) -> Image.Image:
    return remove(img)


def boost_contrast(img: Image.Image) -> Image.Image:
    """CLAHE on the L channel — gives a flatly-lit face real highlights/shadows."""
    arr = np.array(img.convert("RGB"))
    lab = cv2.cvtColor(arr, cv2.COLOR_RGB2LAB)
    l_ch, a_ch, b_ch = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    l_ch = clahe.apply(l_ch)
    lab = cv2.merge((l_ch, a_ch, b_ch))
    return Image.fromarray(cv2.cvtColor(lab, cv2.COLOR_LAB2RGB))


def composite_on_white(img: Image.Image) -> Image.Image:
    if img.mode != "RGBA":
        gray = img.convert("L")
    else:
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        gray = bg.convert("L")

    # rembg leaves a soft, semi-transparent edge (and sometimes a faint drop
    # shadow) around the subject, so near-white pixels aren't quite 255.
    # That reads as background noise once downsampled to an ASCII grid.
    return gray.point(lambda p: 255 if p >= 244 else p)


def main():
    parser = argparse.ArgumentParser(description="Prep a photo for ASCII conversion.")
    parser.add_argument("photo", help="Path to the source photo")
    parser.add_argument("--out", default=str(DEFAULT_OUT), help="Output path for the prepped PNG")
    args = parser.parse_args()

    try:
        src = Image.open(args.photo)
        no_bg = remove_background(src)
        contrasted = boost_contrast(no_bg)
        if no_bg.mode == "RGBA":
            contrasted = contrasted.convert("RGBA")
            contrasted.putalpha(no_bg.split()[3])
        final = composite_on_white(contrasted)

        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        final.save(out_path)
        print(f"Wrote {out_path} ({final.size[0]}x{final.size[1]})")
        return 0
    except Exception as e:
        print("Prep failed:", e, file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
