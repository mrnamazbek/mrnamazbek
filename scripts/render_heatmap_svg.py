import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = ROOT / "artifacts"
IN_FILE = ARTIFACTS_DIR / "contributions.json"
DIST_DIR = ROOT / "dist"
OUT_FILE = DIST_DIR / "contrib-heatmap.svg"

# Same palette family as the rest of the site (bg #0D1117, accent #00F7F7).
BG = "#0D1117"
LEVEL_COLORS = ["#161b22", "#0b3d3d", "#0e5f5f", "#0e9494", "#00F7F7"]
ACCENT = "#00F7F7"
MUTED = "#8b949e"
FONT = "'Fira Code','JetBrains Mono',Consolas,monospace"

BOX = 11
GAP = 3
CELL = BOX + GAP
MARGIN_LEFT = 28
MARGIN_TOP = 48
MARGIN_BOTTOM = 46
MARGIN_RIGHT = 20
MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]


def build_grid(days):
    first_date = datetime.strptime(days[0]["date"], "%Y-%m-%d")
    origin = first_date - timedelta(days=(first_date.weekday() + 1) % 7)  # preceding Sunday

    cells = []
    month_labels = {}
    seen_months = set()
    for d in days:
        date = datetime.strptime(d["date"], "%Y-%m-%d")
        offset = (date - origin).days
        col, row = divmod(offset, 7)
        cells.append({"col": col, "row": row, "level": d["level"], "count": d["count"], "date": d["date"]})
        month_key = (date.year, date.month)
        if date.day <= 7 and month_key not in seen_months:
            seen_months.add(month_key)
            month_labels[col] = MONTHS[date.month - 1]

    total_cols = max(c["col"] for c in cells) + 1
    return cells, month_labels, total_cols


def render(payload):
    days = payload["days"]
    cells, month_labels, total_cols = build_grid(days)

    width = MARGIN_LEFT + total_cols * CELL + MARGIN_RIGHT
    height = MARGIN_TOP + 7 * CELL + MARGIN_BOTTOM

    parts = []
    parts.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}" font-family="{FONT}">'
    )
    parts.append(f'<rect width="{width}" height="{height}" rx="10" fill="{BG}"/>')
    parts.append(
        "<style>"
        ".box{opacity:0;transform-box:fill-box;transform-origin:center;"
        "animation:reveal .45s ease-out forwards}"
        "@keyframes reveal{from{opacity:0;transform:scale(.25)}to{opacity:1;transform:scale(1)}}"
        "</style>"
    )

    title = escape(f"{payload['username']}@github ~ contributions")
    parts.append(
        f'<text x="{MARGIN_LEFT}" y="16" fill="{ACCENT}" font-size="13" font-weight="600">$ {title}</text>'
    )

    for col, label in month_labels.items():
        x = MARGIN_LEFT + col * CELL
        parts.append(f'<text x="{x}" y="{MARGIN_TOP - 16}" fill="{MUTED}" font-size="10">{label}</text>')

    for c in cells:
        x = MARGIN_LEFT + c["col"] * CELL
        y = MARGIN_TOP + c["row"] * CELL
        color = LEVEL_COLORS[min(c["level"], len(LEVEL_COLORS) - 1)]
        delay = (c["col"] + c["row"]) * 9
        title_text = escape(f"{c['count']} contributions on {c['date']}")
        parts.append(
            f'<rect class="box" x="{x}" y="{y}" width="{BOX}" height="{BOX}" rx="2.5" '
            f'fill="{color}" style="animation-delay:{delay}ms"><title>{title_text}</title></rect>'
        )

    legend_y = height - 30
    legend_x = MARGIN_LEFT
    parts.append(f'<text x="{legend_x}" y="{legend_y + 9}" fill="{MUTED}" font-size="10">Less</text>')
    lx = legend_x + 34
    for color in LEVEL_COLORS:
        parts.append(f'<rect x="{lx}" y="{legend_y}" width="{BOX}" height="{BOX}" rx="2.5" fill="{color}"/>')
        lx += CELL
    parts.append(f'<text x="{lx + 4}" y="{legend_y + 9}" fill="{MUTED}" font-size="10">More</text>')

    stats = payload["stats"]
    footer = (
        f"{payload['total_last_year']} contributions in the last year "
        f"· current streak {stats['current_streak']}d "
        f"· longest {stats['longest_streak']}d"
    )
    parts.append(
        f'<text x="{width - MARGIN_RIGHT}" y="{legend_y + 9}" fill="{MUTED}" '
        f'font-size="10" text-anchor="end">{escape(footer)}</text>'
    )

    parts.append("</svg>")
    return "".join(parts)


def main():
    try:
        payload = json.loads(IN_FILE.read_text(encoding="utf-8"))
        if not payload.get("days"):
            raise ValueError("contributions.json has no days — run fetch_contributions.py first")

        svg = render(payload)
        DIST_DIR.mkdir(parents=True, exist_ok=True)
        OUT_FILE.write_text(svg, encoding="utf-8")
        print(f"Wrote {OUT_FILE} ({len(svg)} bytes)")
        return 0
    except Exception as e:
        print("Render failed:", e, file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
