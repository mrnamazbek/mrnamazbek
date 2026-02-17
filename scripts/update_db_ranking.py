import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from urllib.request import Request, urlopen

RANKING_URL = "https://db-engines.com/en/ranking"
OUT_FILE = os.path.join(os.path.dirname(__file__), "..", "assets", "db_ranking.json")

# Map DB names to devicon classes (optional; blank if unknown)
ICON_MAP = {
    "Oracle": "devicon-oracle-original colored",
    "MySQL": "devicon-mysql-plain colored",
    "Microsoft SQL Server": "devicon-microsoftsqlserver-plain colored",
    "PostgreSQL": "devicon-postgresql-plain colored",
    "MongoDB": "devicon-mongodb-plain colored",
    "Redis": "devicon-redis-plain colored",
    "Elasticsearch": "devicon-elasticsearch-plain colored",
}


def fetch_html(url: str) -> str:
    req = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; db-ranking-updater/1.0; +https://github.com/)"
        },
    )
    with urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_top10(html: str):
    """Best-effort parser.

    DB-Engines HTML can change. We:
    - locate the main ranking table
    - extract the first 10 data rows
    - parse: rank, name, model, score (current), delta_mom, delta_yoy

    If parsing fails, raise ValueError.
    """

    # Very defensive: isolate around the table area by searching for the header text.
    # This reduces the chance of false positives elsewhere.
    m = re.search(r"DB-Engines Ranking.*?Rank", html, re.IGNORECASE | re.DOTALL)
    if not m:
        raise ValueError("Could not locate ranking header")

    # Extract table rows. DB-Engines uses <tr>..</tr>.
    # We'll parse cell text by stripping tags.
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", html, flags=re.IGNORECASE | re.DOTALL)
    if not rows or len(rows) < 12:
        raise ValueError("Could not locate enough table rows")

    def strip_tags(s: str) -> str:
        s = re.sub(r"<script.*?</script>", " ", s, flags=re.IGNORECASE | re.DOTALL)
        s = re.sub(r"<style.*?</style>", " ", s, flags=re.IGNORECASE | re.DOTALL)
        s = re.sub(r"<[^>]+>", " ", s)
        s = s.replace("\xa0", " ")
        s = re.sub(r"\s+", " ", s).strip()
        return s

    items = []

    # Heuristic: data rows contain a score number with decimal and the DBMS name.
    for r in rows:
        text = strip_tags(r)
        # Typical row begins with "1. Oracle Relational, Multi-model 1203.51 -33.82 -51.31"
        # But the table also includes historical rank columns. We'll match a robust pattern.
        # Find rank + name + model + score + mom + yoy.
        # Name can contain spaces.
        # Model field often contains commas.
        m = re.search(
            r"\b(\d{1,3})\.\s+(.*?)\s+(Relational|Document|Key-value|Multi-model|Graph|Wide column|Search|Time series|Object|Hierarchical|Network|RDF|Vector)[^\d-+]*([0-9]+\.[0-9]+)\s*([+-][0-9]+\.[0-9]+)\s*([+-][0-9]+\.[0-9]+)",
            text,
            flags=re.IGNORECASE,
        )
        if not m:
            continue

        rank = int(m.group(1))
        name = m.group(2).strip()
        # Model: take from the first occurrence of known model keyword onwards
        model_start = m.start(3)
        model_end = m.start(4)
        model = text[model_start:model_end].strip().rstrip("·").strip()
        score = float(m.group(4))
        delta_mom = float(m.group(5))
        delta_yoy = float(m.group(6))

        items.append(
            {
                "rank": rank,
                "name": name,
                "model": model,
                "score_feb_2026": score,  # will be renamed to current month later
                "delta_mom": delta_mom,
                "delta_yoy": delta_yoy,
                "icon": ICON_MAP.get(name, ""),
            }
        )

        if len(items) >= 10:
            break

    if len(items) < 10:
        raise ValueError(f"Parsed only {len(items)} items")

    return items


def rewrite_schema(items, now=None):
    """Write a month-aware schema: score_<mon>_<year>, and also keep score_jan_.../score_prev_year if possible.

    DB-Engines only gives current score + deltas (MoM/YoY). We reconstruct:
    - previous month score = current - delta_mom
    - previous year score = current - delta_yoy

    For simplicity, we store keys as:
    - score_current
    - score_prev_month
    - score_prev_year
    And also store labels.

    (Your frontend normalization supports both explicit fields and derived deltas.)
    """
    if now is None:
        now = datetime.now(timezone.utc)

    # Note: DB-Engines updates monthly; we treat "now" month as "current".
    month_label = now.strftime("%b %Y")

    out = []
    for it in items:
        cur = float(it["score_feb_2026"])
        mom = float(it["delta_mom"])
        yoy = float(it["delta_yoy"])
        out.append(
            {
                "rank": int(it["rank"]),
                "name": it["name"],
                "model": it["model"],
                "score_current": round(cur, 2),
                "score_prev_month": round(cur - mom, 2),
                "score_prev_year": round(cur - yoy, 2),
                "delta_mom": round(mom, 2),
                "delta_yoy": round(yoy, 2),
                "as_of": month_label,
                "source": RANKING_URL,
                "icon": it.get("icon", ""),
            }
        )

    return out


def main():
    try:
        html = fetch_html(RANKING_URL)
        items = parse_top10(html)
        payload = rewrite_schema(items)

        os.makedirs(os.path.dirname(os.path.abspath(OUT_FILE)), exist_ok=True)
        with open(OUT_FILE, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
            f.write("\n")

        print(f"Wrote {OUT_FILE} with {len(payload)} items")
        return 0
    except Exception as e:
        print("Update failed:", e, file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
