import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = ROOT / "artifacts"
OUT_FILE = ARTIFACTS_DIR / "contributions.json"

GITHUB_USERNAME = "mrnamazbek"
CONTRIB_URL = f"https://github.com/users/{GITHUB_USERNAME}/contributions"


def fetch_html(url: str) -> str:
    req = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; profile-art-bot/1.0; +https://github.com/)"
        },
    )
    with urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_total(html: str) -> int:
    m = re.search(
        r'id="js-contribution-activity-description"[^>]*>(.*?)</h2>',
        html,
        re.IGNORECASE | re.DOTALL,
    )
    if not m:
        return 0
    digits = re.search(r"([\d,]+)", m.group(1))
    return int(digits.group(1).replace(",", "")) if digits else 0


def parse_days(html: str):
    """Best-effort parser for the public contributions fragment.

    GitHub renders each day as a <td class="ContributionCalendar-day"
    data-date="..." data-level="..." id="contribution-day-component-R-C">
    and a matching <tool-tip for="...">N contributions on Month Dth.</tool-tip>
    with the exact count. We join the two by id/for.
    """
    cells = re.findall(r"<td[^>]*class=\"ContributionCalendar-day\"[^>]*>", html)
    if not cells:
        cells = re.findall(r'<td[^>]*data-date="[0-9-]+"[^>]*>', html)

    days = {}
    for cell in cells:
        date_m = re.search(r'data-date="([0-9-]+)"', cell)
        level_m = re.search(r'data-level="(\d)"', cell)
        id_m = re.search(r'id="(contribution-day-component-[0-9-]+)"', cell)
        if not (date_m and level_m and id_m):
            continue
        days[id_m.group(1)] = {
            "date": date_m.group(1),
            "level": int(level_m.group(1)),
            "count": 0,
        }

    tooltips = re.findall(
        r'<tool-tip[^>]*for="(contribution-day-component-[0-9-]+)"[^>]*>([^<]*)</tool-tip>',
        html,
    )
    for cell_id, text in tooltips:
        if cell_id not in days:
            continue
        count_m = re.search(r"(\d+)\s+contributions?", text)
        days[cell_id]["count"] = int(count_m.group(1)) if count_m else 0

    return sorted(days.values(), key=lambda d: d["date"])


def compute_stats(days):
    if not days:
        return {"current_streak": 0, "longest_streak": 0, "best_day": None}

    longest = running = 0
    for d in days:
        if d["count"] > 0:
            running += 1
            longest = max(longest, running)
        else:
            running = 0

    current = 0
    for d in reversed(days):
        if d["count"] > 0:
            current += 1
        else:
            break

    best_day = max(days, key=lambda d: d["count"])
    return {
        "current_streak": current,
        "longest_streak": longest,
        "best_day": (
            {"date": best_day["date"], "count": best_day["count"]}
            if best_day["count"] > 0
            else None
        ),
    }


def main():
    try:
        html = fetch_html(CONTRIB_URL)
        days = parse_days(html)
        if len(days) < 300:
            raise ValueError(
                f"Parsed only {len(days)} day cells — GitHub markup may have changed"
            )

        payload = {
            "username": GITHUB_USERNAME,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_last_year": parse_total(html),
            "stats": compute_stats(days),
            "days": days,
        }

        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        with open(OUT_FILE, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
            f.write("\n")

        print(f"Wrote {OUT_FILE} with {len(days)} days, total={payload['total_last_year']}")
        return 0
    except Exception as e:
        print("Fetch failed:", e, file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
