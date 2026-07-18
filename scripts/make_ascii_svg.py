"""Local-only helper — not run by CI. Run scripts/prep_photo.py first.

Usage: python scripts/make_ascii_svg.py
"""
import argparse
import sys
from pathlib import Path
from xml.sax.saxutils import escape

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_IN = ROOT / "assets" / "avatar-prepped.png"
DEFAULT_OUT = ROOT / "assets" / "avatar-ascii.svg"

RAMP = " .`:-=+*cs#%@"  # bright (sparse) -> dark (dense); leading space clears the background
COLS = 100
FILL = "#8b949e"  # muted, monochrome — matches the site's terminal text color
FONT = "'Fira Code','JetBrains Mono',Consolas,monospace"
CHAR_W = 6.1
CHAR_H = 11


def image_to_grid(img: Image.Image, cols: int):
    w, h = img.size
    aspect = CHAR_W / CHAR_H  # terminal cells are taller than wide
    rows = max(1, round(cols * (h / w) * aspect))
    small = img.convert("L").resize((cols, rows))
    pixels = list(small.getdata())

    grid = []
    for r in range(rows):
        row_chars = []
        for c in range(cols):
            brightness = pixels[r * cols + c]  # 0=black .. 255=white
            idx = int((255 - brightness) / 255 * (len(RAMP) - 1))
            row_chars.append(RAMP[idx])
        grid.append("".join(row_chars))
    return grid


def render(grid):
    cols = max(len(r) for r in grid)
    width = cols * CHAR_W + 20
    height = len(grid) * CHAR_H + 20

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:.0f}" height="{height:.0f}" '
        f'viewBox="0 0 {width:.0f} {height:.0f}" font-family="{FONT}">',
        f'<rect width="{width:.0f}" height="{height:.0f}" fill="#0D1117"/>',
        # Same fade+slide language as info-card.svg, staggered top to bottom
        # so the portrait "prints" once, then freezes (no looping).
        "<style>"
        ".row{opacity:0;animation:fadein .4s ease-out forwards}"
        "@keyframes fadein{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}"
        "</style>",
    ]

    for i, row in enumerate(grid):
        y = 10 + (i + 1) * CHAR_H
        delay = i * 35
        parts.append(
            f'<text class="row" x="10" y="{y:.0f}" fill="{FILL}" font-size="{CHAR_H}" '
            f'xml:space="preserve" style="animation-delay:{delay}ms">{escape(row)}</text>'
        )

    parts.append("</svg>")
    return "".join(parts)


def main():
    parser = argparse.ArgumentParser(description="Convert a prepped photo into a self-typing ASCII SVG.")
    parser.add_argument("--in", dest="input", default=str(DEFAULT_IN))
    parser.add_argument("--out", default=str(DEFAULT_OUT))
    parser.add_argument("--cols", type=int, default=COLS)
    args = parser.parse_args()

    try:
        img = Image.open(args.input)
        grid = image_to_grid(img, args.cols)
        svg = render(grid)

        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(svg, encoding="utf-8")
        print(f"Wrote {out_path} ({len(grid)} rows x {args.cols} cols)")
        return 0
    except Exception as e:
        print("Render failed:", e, file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
