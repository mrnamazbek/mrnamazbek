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

    # Extract table rows (works when page is server-side rendered as a <table>).
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", html, flags=re.IGNORECASE | re.DOTALL)

    def strip_tags(s: str) -> str:
        s = re.sub(r"<script.*?</script>", " ", s, flags=re.IGNORECASE | re.DOTALL)
        s = re.sub(r"<style.*?</style>", " ", s, flags=re.IGNORECASE | re.DOTALL)
        s = re.sub(r"<[^>]+>", " ", s)
        s = s.replace("\xa0", " ")
        s = re.sub(r"\s+", " ", s).strip()
        return s

    items = []

    def parse_from_rows(tr_rows):
        parsed = []
        for r in tr_rows:
            text = strip_tags(r)
            # Example after stripping:
            # "1. Oracle Relational, Multi-model 1203.51 -33.82 -51.31"
            m2 = re.search(
                r"\b(\d{1,3})\.\s+(.+?)\s+((?:Relational|Document|Key-value|Multi-model|Wide column|Search|Time Series|Graph|RDF|Spatial|Vector)[^\d-+]{0,120})\s+([0-9]+\.[0-9]+)\s*([+-][0-9]+\.[0-9]+)\s*([+-][0-9]+\.[0-9]+)",
                text,
                flags=re.IGNORECASE,
            )
            if not m2:
                continue
            rank = int(m2.group(1))
            name = m2.group(2).strip()
            model = re.sub(r"\s+", " ", m2.group(3)).strip()
            score = float(m2.group(4))
            delta_mom = float(m2.group(5))
            delta_yoy = float(m2.group(6))
            parsed.append(
                {
                    "rank": rank,
                    "name": name,
                    "model": model,
                    "score_feb_2026": score,  # renamed later
                    "delta_mom": delta_mom,
                    "delta_yoy": delta_yoy,
                    "icon": ICON_MAP.get(name, ""),
                }
            )
            if len(parsed) >= 10:
                break
        return parsed

    def parse_from_full_text(full_html):
        # Fallback when DB-Engines is rendered without <tr> rows (or HTML structure changes).
        text = strip_tags(full_html)
        # Find the section starting at the first rank.
        idx = text.find("1.")
        if idx > 0:
            text = text[idx:]

        parsed = []
        # Match: "1.1.1.OracleRelational, Multi-model1203.51-33.82-51.31" (spaces may be missing)
        # Keep it tolerant: require rank, name, model keywords, score, mom, yoy.
        pattern = re.compile(
            r"\b(\d{1,3})\.\s*(?:\d{1,3}\.\s*)?(?:\d{1,3}\.\s*)?"  # historical rank columns sometimes appear
            r"([A-Za-z0-9][A-Za-z0-9 .+\-/&()]*?)"  # name
            r"\s*(Relational|Document|Key-value|Multi-model|Wide column|Search|Time Series|Graph|RDF|Spatial|Vector)"  # model anchor
            r"([^\d]{0,120}?)"  # remainder of model
            r"\s*([0-9]+\.[0-9]+)\s*([+-][0-9]+\.[0-9]+)\s*([+-][0-9]+\.[0-9]+)",
            flags=re.IGNORECASE,
        )

        for m2 in pattern.finditer(text):
            rank = int(m2.group(1))
            name = re.sub(r"\s+", " ", m2.group(2)).strip()
            model = (m2.group(3) + (m2.group(4) or "")).strip()
            model = re.sub(r"\s+", " ", model)
            score = float(m2.group(5))
            delta_mom = float(m2.group(6))
            delta_yoy = float(m2.group(7))
            parsed.append(
                {
                    "rank": rank,
                    "name": name,
                    "model": model,
                    "score_feb_2026": score,
                    "delta_mom": delta_mom,
                    "delta_yoy": delta_yoy,
                    "icon": ICON_MAP.get(name, ""),
                }
            )
            if len(parsed) >= 10:
                break
        return parsed

    if rows and len(rows) >= 3:
        items = parse_from_rows(rows)

    if len(items) < 10:
        items = parse_from_full_text(html)

    if len(items) < 10:
        # Provide diagnostics for GitHub Actions logs.
        lower = html.lower()
        hints = []
        for token in ["captcha", "cloudflare", "access denied", "enable javascript", "blocked", "robot"]:
            if token in lower:
                hints.append(token)
        raise ValueError(
            "Parsed only " + str(len(items)) + " items. "
            + "HTML length=" + str(len(html)) + ", tr_count=" + str(len(rows))
            + (", hints=" + ",".join(hints) if hints else "")
        )

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
