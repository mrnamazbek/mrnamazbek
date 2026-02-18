import json
import os
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parent.parent
OUT_FILE = ROOT / "assets" / "ai_audience_weekly.json"

API_TEMPLATE = (
    "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
    "en.wikipedia.org/all-access/user/{article}/daily/{start}/{end}"
)

TOOLS = [
    {"id": "chatgpt", "label": "ChatGPT", "article": "ChatGPT", "color": "#22d3ee"},
    {"id": "claude", "label": "Claude", "article": "Claude_(language_model)", "color": "#60a5fa"},
    {"id": "gemini", "label": "Gemini", "article": "Gemini_(chatbot)", "color": "#a78bfa"},
    {"id": "copilot", "label": "Copilot", "article": "Microsoft_Copilot", "color": "#34d399"},
    {"id": "perplexity", "label": "Perplexity", "article": "Perplexity_AI", "color": "#f59e0b"},
    {"id": "deepseek", "label": "DeepSeek", "article": "DeepSeek", "color": "#f472b6"},
]

WEEKS_TO_KEEP = 24
DAYS_BACK = 220


class DataError(Exception):
    pass


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def http_get_json(url: str, timeout: int = 45) -> Dict:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; ai-audience-updater/1.0; +https://github.com/)"
        },
    )

    context = ssl.create_default_context()

    try:
        with urllib.request.urlopen(request, timeout=timeout, context=context) as response:
            raw = response.read().decode("utf-8", errors="replace")
    except urllib.error.URLError as exc:
        allow_insecure = os.getenv("ALLOW_INSECURE_SSL_FALLBACK", "0") == "1"
        reason = getattr(exc, "reason", None)
        if allow_insecure and isinstance(reason, ssl.SSLCertVerificationError):
            insecure_context = ssl._create_unverified_context()
            with urllib.request.urlopen(request, timeout=timeout, context=insecure_context) as response:
                raw = response.read().decode("utf-8", errors="replace")
        else:
            raise

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise DataError(f"Failed to parse JSON response from {url}: {exc}") from exc

    if not isinstance(payload, dict):
        raise DataError(f"Unexpected payload type from {url}")

    return payload


def week_start(d: date) -> date:
    return d - timedelta(days=d.weekday())


def fetch_daily_article_views(article: str, start: date, end: date) -> List[Tuple[date, int]]:
    encoded_article = urllib.parse.quote(article, safe="")
    url = API_TEMPLATE.format(
        article=encoded_article,
        start=start.strftime("%Y%m%d"),
        end=end.strftime("%Y%m%d"),
    )

    payload = http_get_json(url)
    items = payload.get("items") if isinstance(payload.get("items"), list) else []

    out: List[Tuple[date, int]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        ts = str(item.get("timestamp", ""))
        views_raw = item.get("views", 0)
        if len(ts) < 8:
            continue
        try:
            d = datetime.strptime(ts[:8], "%Y%m%d").date()
            views = int(views_raw)
        except (ValueError, TypeError):
            continue
        out.append((d, max(0, views)))

    return out


def aggregate_weekly(daily_points: List[Tuple[date, int]]) -> Dict[str, int]:
    weekly: Dict[str, int] = {}
    for d, views in daily_points:
        wk = week_start(d).isoformat()
        weekly[wk] = weekly.get(wk, 0) + views
    return weekly


def choose_weeks(all_week_keys: List[str]) -> List[str]:
    uniq = sorted(set(all_week_keys))
    if len(uniq) <= WEEKS_TO_KEEP:
        return uniq
    return uniq[-WEEKS_TO_KEEP:]


def build_payload(existing: Dict = None) -> Dict:
    today_utc = datetime.now(timezone.utc).date()
    end = today_utc - timedelta(days=1)
    start = end - timedelta(days=DAYS_BACK)

    collected = []
    errors = []
    all_weeks: List[str] = []

    for tool in TOOLS:
        try:
            daily = fetch_daily_article_views(tool["article"], start, end)
            weekly = aggregate_weekly(daily)
            all_weeks.extend(weekly.keys())
            collected.append({
                "tool": tool,
                "weekly": weekly,
            })
        except Exception as exc:
            errors.append(f"{tool['label']}: {exc}")
            collected.append({
                "tool": tool,
                "weekly": {},
            })

    weeks = choose_weeks(all_weeks)

    if not weeks:
        if existing and isinstance(existing, dict):
            existing = dict(existing)
            existing["generated_at"] = datetime.now(timezone.utc).isoformat()
            existing["status"] = "fallback_existing"
            existing["errors"] = errors
            return existing
        raise DataError("No weekly data available from Wikimedia API.")

    series = []
    for item in collected:
        tool = item["tool"]
        weekly = item["weekly"]
        points = [{"week": wk, "views": int(weekly.get(wk, 0))} for wk in weeks]
        series.append({
            "id": tool["id"],
            "label": tool["label"],
            "article": tool["article"],
            "color": tool["color"],
            "points": points,
        })

    latest_week = weeks[-1]
    latest_rank = sorted(
        [
            {
                "id": s["id"],
                "label": s["label"],
                "views": int(s["points"][-1]["views"] if s["points"] else 0),
            }
            for s in series
        ],
        key=lambda x: x["views"],
        reverse=True,
    )

    return {
        "as_of": latest_week,
        "window_weeks": len(weeks),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "ok" if not errors else "partial",
        "methodology": (
            "Weekly audience proxy based on en.wikipedia.org pageviews for each AI product article. "
            "This is not unique active users."
        ),
        "source": {
            "name": "Wikimedia Pageviews API",
            "docs": [
                "https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/tutorials/compare-page-metrics.html",
                "https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/getting-started/",
            ],
        },
        "series": series,
        "latest_rank": latest_rank,
        "errors": errors,
    }


def main() -> int:
    existing = None
    if OUT_FILE.exists():
        try:
            existing = json.loads(OUT_FILE.read_text(encoding="utf-8"))
        except Exception:
            existing = None

    try:
        payload = build_payload(existing=existing if isinstance(existing, dict) else None)
    except Exception as exc:
        print(f"[ai-audience-weekly] ERROR: {exc}", file=sys.stderr)
        return 1

    ensure_dir(OUT_FILE.parent)
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[ai-audience-weekly] Wrote {OUT_FILE}")
    print(f"[ai-audience-weekly] Status: {payload.get('status')} | as_of={payload.get('as_of')}")
    if payload.get("errors"):
        print("[ai-audience-weekly] Non-fatal source errors:")
        for err in payload["errors"]:
            print(" - " + err)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
