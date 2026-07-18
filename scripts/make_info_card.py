import sys
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = ROOT / "dist"
OUT_FILE = DIST_DIR / "info-card.svg"

BG = "#0D1117"
ACCENT = "#00F7F7"
LABEL = "#8b949e"
VALUE = "#c9d1d9"
BORDER = "#21262d"
FONT = "'Fira Code','JetBrains Mono',Consolas,monospace"

# Keep in sync with the `Engineer` dataclass in the README's profile.py block.
ROWS = [
    ("OS", "Almaty, Kazakhstan 🇰🇿"),
    ("Role", "Middle Data Engineer"),
    ("Now", "The National Bank of Kazakhstan"),
    ("Also", "Freedom Insurance"),
    ("Education", "MSc Data Science @ KBTU · GPA 3.88"),
    ("Stack", "Python · SQL · Airflow · Kafka · Docker · K8s"),
    ("Highlight", "~78% pipeline speedup (9min -> 2min)"),
]

SWATCHES = ["#161b22", "#0b3d3d", "#0e5f5f", "#0e9494", "#00F7F7", "#c9d1d9"]

WIDTH = 500
ROW_H = 24
TITLE_BAR_H = 34
TOP_INSET = 30
BOTTOM_PAD = 22


def render():
    # Build the body first and track the real cursor position, so the
    # card height always matches its content instead of a hand-guessed number.
    body = []
    y = TITLE_BAR_H + TOP_INSET
    body.append(
        f'<text class="line" x="24" y="{y}" fill="{ACCENT}" font-size="12" font-weight="600" '
        f'style="animation-delay:0ms">$ whoami</text>'
    )
    y += ROW_H

    label_w = max(len(k) for k, _ in ROWS) + 1
    for i, (key, value) in enumerate(ROWS):
        delay = 80 + i * 70
        key_text = escape(key.ljust(label_w))
        body.append(
            f'<text class="line" x="24" y="{y}" font-size="12" style="animation-delay:{delay}ms">'
            f'<tspan fill="{ACCENT}">{key_text}</tspan>'
            f'<tspan fill="{LABEL}">: </tspan>'
            f'<tspan fill="{VALUE}">{escape(value)}</tspan>'
            f"</text>"
        )
        y += ROW_H

    sw_y = y + 4
    sw_delay = 80 + len(ROWS) * 70
    for i, color in enumerate(SWATCHES):
        body.append(
            f'<rect class="line" x="{24 + i * 18}" y="{sw_y}" width="14" height="14" rx="3" '
            f'fill="{color}" style="animation-delay:{sw_delay + i * 40}ms"/>'
        )
    y = sw_y + 14

    height = y + BOTTOM_PAD

    parts = []
    parts.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{height}" '
        f'viewBox="0 0 {WIDTH} {height}" font-family="{FONT}">'
    )
    parts.append(
        f'<rect x="0.5" y="0.5" width="{WIDTH - 1}" height="{height - 1}" rx="10" '
        f'fill="{BG}" stroke="{BORDER}"/>'
    )
    parts.append(
        "<style>"
        ".line{opacity:0;animation:fadein .4s ease-out forwards}"
        "@keyframes fadein{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}"
        "</style>"
    )

    # Title bar with traffic-light dots, like a terminal window.
    parts.append(f'<rect x="0.5" y="0.5" width="{WIDTH - 1}" height="{TITLE_BAR_H}" rx="10" fill="#161b22"/>')
    parts.append(f'<rect x="0.5" y="{TITLE_BAR_H - 10}" width="{WIDTH - 1}" height="10" fill="#161b22"/>')
    for i, c in enumerate(["#ff5f56", "#ffbd2e", "#27c93f"]):
        parts.append(f'<circle cx="{18 + i * 16}" cy="{TITLE_BAR_H / 2}" r="5" fill="{c}"/>')
    parts.append(
        f'<text x="{WIDTH / 2}" y="{TITLE_BAR_H / 2 + 4}" fill="{LABEL}" font-size="11" '
        f'text-anchor="middle">mrnamazbek@github: ~/neofetch</text>'
    )

    parts.extend(body)
    parts.append("</svg>")
    return "".join(parts)


def main():
    try:
        svg = render()
        DIST_DIR.mkdir(parents=True, exist_ok=True)
        OUT_FILE.write_text(svg, encoding="utf-8")
        print(f"Wrote {OUT_FILE} ({len(svg)} bytes)")
        return 0
    except Exception as e:
        print("Render failed:", e, file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
