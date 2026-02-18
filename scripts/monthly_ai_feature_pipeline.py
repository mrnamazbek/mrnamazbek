import argparse
import json
import os
import re
import ssl
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "assets"
TESTS_DIR = ROOT / "tests"
ARTIFACTS_DIR = ROOT / "artifacts"

CURRENT_FEATURE_FILE = ASSETS_DIR / "ai_monthly_feature.json"
FEATURE_HISTORY_FILE = ASSETS_DIR / "ai_feature_history.json"
GENERATED_TEST_FILE = TESTS_DIR / "monthly-ai-feature.spec.js"
COMMIT_MSG_FILE = ARTIFACTS_DIR / "monthly-feature-commit-message.txt"
BRIEF_FILE = ARTIFACTS_DIR / "monthly-feature-brief.md"

GOOGLE_TRENDS_RSS_URL = "https://trends.google.com/trending/rss?geo={geo}"
DEFAULT_MODEL = "gpt-5.2"
DEFAULT_BASE_URL = "https://api.openai.com/v1"

ALLOWED_WIDGET_TYPES = {"impact_estimator", "tradeoff_matrix", "roadmap_planner"}
TECH_TREND_HINTS = (
    "ai",
    "agent",
    "automation",
    "software",
    "developer",
    "programming",
    "python",
    "openai",
    "chatgpt",
    "github",
    "cloud",
    "data",
    "machine learning",
    "ml",
    "llm",
    "saas",
    "cyber",
    "robot",
)


class PipelineError(Exception):
    pass


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: Path, payload: Any) -> None:
    ensure_dir(path.parent)
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write("\n")


def write_text(path: Path, text: str) -> None:
    ensure_dir(path.parent)
    with path.open("w", encoding="utf-8") as f:
        f.write(text)


def _open_url(request: urllib.request.Request, timeout: int = 45) -> bytes:
    context = ssl.create_default_context()
    try:
        with urllib.request.urlopen(request, timeout=timeout, context=context) as response:
            return response.read()
    except urllib.error.URLError as exc:
        allow_insecure = os.getenv("ALLOW_INSECURE_SSL_FALLBACK", "0") == "1"
        reason = getattr(exc, "reason", None)
        if allow_insecure and isinstance(reason, ssl.SSLCertVerificationError):
            insecure_context = ssl._create_unverified_context()
            with urllib.request.urlopen(request, timeout=timeout, context=insecure_context) as response:
                return response.read()
        raise


def http_get_text(url: str, headers: Dict[str, str], timeout: int = 45) -> str:
    req = urllib.request.Request(url, headers=headers)
    payload = _open_url(req, timeout=timeout)
    return payload.decode("utf-8", errors="replace")


def http_post_json(url: str, headers: Dict[str, str], body: Dict[str, Any], timeout: int = 75) -> Dict[str, Any]:
    encoded = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=encoded, headers=headers, method="POST")
    payload = _open_url(req, timeout=timeout)
    try:
        return json.loads(payload.decode("utf-8", errors="replace"))
    except json.JSONDecodeError as exc:
        raise PipelineError(f"Failed to decode JSON response from {url}: {exc}") from exc


def fetch_google_trends(geo: str) -> List[Dict[str, str]]:
    url = GOOGLE_TRENDS_RSS_URL.format(geo=urllib.parse.quote(geo.strip() or "KZ"))
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; monthly-ai-feature/1.0; +https://github.com/)"
    }
    xml_text = http_get_text(url, headers=headers)

    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError as exc:
        raise PipelineError(f"Unable to parse Google Trends RSS: {exc}") from exc

    ns = {
        "ht": "https://trends.google.com/trends/trendingsearches/daily"
    }

    channel = root.find("channel")
    if channel is None:
        return []

    items: List[Dict[str, str]] = []
    for item in channel.findall("item"):
        title = (item.findtext("title") or "").strip()
        pub_date = (item.findtext("pubDate") or "").strip()
        traffic = (item.findtext("ht:approx_traffic", default="", namespaces=ns) or "").strip()
        link = (item.findtext("link") or "").strip()
        if not title:
            continue
        items.append(
            {
                "title": title,
                "approx_traffic": traffic,
                "pub_date": pub_date,
                "link": link,
            }
        )

    return items


def sanitize_slug(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    if not slug:
        slug = "trend-feature"
    return slug[:42]


def prioritize_trends(trends: List[Dict[str, str]]) -> List[Dict[str, str]]:
    if not trends:
        return []

    def score(item: Dict[str, str]) -> int:
        title = str(item.get("title", "")).lower()
        value = 0
        for hint in TECH_TREND_HINTS:
            if hint in title:
                value += 1
        return value

    ranked = sorted(trends, key=lambda x: score(x), reverse=True)
    return ranked


def normalize_string(value: Any, default: str, max_len: int = 240) -> str:
    text = str(value or "").strip()
    if not text:
        text = default
    return text[:max_len]


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def normalize_impact_widget(config: Any) -> Dict[str, Any]:
    cfg = config if isinstance(config, dict) else {}
    min_v = int(clamp(float(cfg.get("min", 0)), 0, 90))
    max_v = int(clamp(float(cfg.get("max", 100)), min_v + 5, 100))
    default_v = int(clamp(float(cfg.get("default", 45)), min_v, max_v))
    step = int(clamp(float(cfg.get("step", 5)), 1, 20))
    baseline_hours = float(clamp(float(cfg.get("baseline_hours", 48)), 8, 400))
    efficiency_factor = float(clamp(float(cfg.get("efficiency_factor", 0.55)), 0.1, 1.0))
    return {
        "input_label": normalize_string(cfg.get("input_label"), "Automation coverage"),
        "min": min_v,
        "max": max_v,
        "step": step,
        "default": default_v,
        "baseline_hours": round(baseline_hours, 2),
        "efficiency_factor": round(efficiency_factor, 2),
    }


def normalize_tradeoff_widget(config: Any) -> Dict[str, Any]:
    cfg = config if isinstance(config, dict) else {}
    outcomes_in = cfg.get("outcomes") if isinstance(cfg.get("outcomes"), list) else []
    options_in = cfg.get("options") if isinstance(cfg.get("options"), list) else []

    outcomes: List[Dict[str, str]] = []
    for idx, item in enumerate(outcomes_in[:4]):
        if not isinstance(item, dict):
            continue
        raw_id = normalize_string(item.get("id"), f"outcome-{idx + 1}", max_len=40)
        outcome_id = sanitize_slug(raw_id)
        outcomes.append(
            {
                "id": outcome_id,
                "title": normalize_string(item.get("title"), f"Outcome {idx + 1}", max_len=90),
                "description": normalize_string(item.get("description"), "No description provided.", max_len=260),
            }
        )

    if len(outcomes) < 2:
        outcomes = [
            {
                "id": "ship-fast",
                "title": "Ship Fast",
                "description": "Optimize for shorter cycle time and frequent releases.",
            },
            {
                "id": "harden-reliability",
                "title": "Harden Reliability",
                "description": "Prioritize test depth, monitoring, and operational safety.",
            },
        ]

    outcome_ids = [o["id"] for o in outcomes]

    options: List[Dict[str, Any]] = []
    for idx, item in enumerate(options_in[:4]):
        if not isinstance(item, dict):
            continue
        raw_scores = item.get("scores") if isinstance(item.get("scores"), dict) else {}
        scores: Dict[str, int] = {}
        for outcome_id in outcome_ids:
            raw_score = raw_scores.get(outcome_id, 0)
            try:
                score = int(clamp(float(raw_score), 0, 10))
            except (TypeError, ValueError):
                score = 0
            scores[outcome_id] = score

        options.append(
            {
                "label": normalize_string(item.get("label"), f"Option {idx + 1}", max_len=70),
                "hint": normalize_string(item.get("hint"), "", max_len=140),
                "scores": scores,
            }
        )

    if len(options) < 2:
        options = [
            {
                "label": "Need faster delivery",
                "hint": "Focus on shorter lead time",
                "scores": {
                    outcome_ids[0]: 9,
                    outcome_ids[1]: 3,
                },
            },
            {
                "label": "Need stronger stability",
                "hint": "Reduce incidents and regressions",
                "scores": {
                    outcome_ids[0]: 4,
                    outcome_ids[1]: 9,
                },
            },
        ]

    return {
        "question": normalize_string(cfg.get("question"), "Which priority best matches this month?", max_len=120),
        "options": options,
        "outcomes": outcomes,
    }


def normalize_roadmap_widget(config: Any) -> Dict[str, Any]:
    cfg = config if isinstance(config, dict) else {}
    steps_in = cfg.get("steps") if isinstance(cfg.get("steps"), list) else []
    steps: List[Dict[str, Any]] = []
    for idx, step in enumerate(steps_in[:6]):
        if not isinstance(step, dict):
            continue
        try:
            weeks = float(clamp(float(step.get("weeks", 0.2)), 0.1, 8.0))
        except (TypeError, ValueError):
            weeks = 0.2
        steps.append(
            {
                "name": normalize_string(step.get("name"), f"Step {idx + 1}", max_len=80),
                "detail": normalize_string(step.get("detail"), "", max_len=200),
                "weeks": round(weeks, 1),
            }
        )

    if len(steps) < 3:
        steps = [
            {"name": "Trend discovery", "detail": "Select one trend and relevance to the portfolio.", "weeks": 0.2},
            {"name": "Feature implementation", "detail": "Build interaction and connect data sources.", "weeks": 0.4},
            {"name": "QA + release", "detail": "Run mobile checks, tests, and ship automatically.", "weeks": 0.3},
        ]

    return {"steps": steps}


def normalize_widget(widget: Any) -> Dict[str, Any]:
    obj = widget if isinstance(widget, dict) else {}
    widget_type = normalize_string(obj.get("type"), "roadmap_planner", max_len=40)
    widget_type = sanitize_slug(widget_type).replace("-", "_")
    if widget_type not in ALLOWED_WIDGET_TYPES:
        widget_type = "roadmap_planner"

    heading = normalize_string(obj.get("heading"), "Monthly AI Feature", max_len=120)
    description = normalize_string(obj.get("description"), "", max_len=220)
    raw_config = obj.get("config")

    if widget_type == "impact_estimator":
        config = normalize_impact_widget(raw_config)
    elif widget_type == "tradeoff_matrix":
        config = normalize_tradeoff_widget(raw_config)
    else:
        config = normalize_roadmap_widget(raw_config)

    return {
        "type": widget_type,
        "heading": heading,
        "description": description,
        "config": config,
    }


def build_fallback_spec(trends: List[Dict[str, str]], month_key: str) -> Dict[str, Any]:
    trend_title = "AI automation"
    for item in trends:
        title = str(item.get("title", "")).strip()
        if not title:
            continue
        if any(hint in title.lower() for hint in TECH_TREND_HINTS):
            trend_title = title
            break
    month_num = int(month_key.split("-")[1])
    widget_cycle = ["impact_estimator", "tradeoff_matrix", "roadmap_planner"]
    chosen_widget = widget_cycle[month_num % 3]

    if chosen_widget == "impact_estimator":
        widget = {
            "type": "impact_estimator",
            "heading": f"{trend_title}: Capacity Estimator",
            "description": "Estimate monthly engineering time unlocked by automation.",
            "config": {
                "input_label": "Automation coverage",
                "min": 0,
                "max": 100,
                "step": 5,
                "default": 50,
                "baseline_hours": 52,
                "efficiency_factor": 0.6,
            },
        }
    elif chosen_widget == "tradeoff_matrix":
        widget = {
            "type": "tradeoff_matrix",
            "heading": f"{trend_title}: Strategy Matrix",
            "description": "Pick your main delivery priority and get a recommended operating mode.",
            "config": {
                "question": "Which outcome matters most this month?",
                "options": [
                    {
                        "label": "Fast releases",
                        "hint": "Prioritize lead time",
                        "scores": {"ship-fast": 9, "harden-reliability": 4},
                    },
                    {
                        "label": "Stable operations",
                        "hint": "Prioritize reliability",
                        "scores": {"ship-fast": 3, "harden-reliability": 9},
                    },
                ],
                "outcomes": [
                    {
                        "id": "ship-fast",
                        "title": "Rapid Mode",
                        "description": "Use smaller increments, AI-assisted scaffolding, and tighter review windows.",
                    },
                    {
                        "id": "harden-reliability",
                        "title": "Reliability Mode",
                        "description": "Increase test gates, visual checks, and rollout safeguards before merge.",
                    },
                ],
            },
        }
    else:
        widget = {
            "type": "roadmap_planner",
            "heading": f"{trend_title}: 4-Step Rollout",
            "description": "Track rollout tasks and completion progress.",
            "config": {
                "steps": [
                    {"name": "Trend analysis", "detail": "Confirm relevance and user value.", "weeks": 0.2},
                    {"name": "Build", "detail": "Implement feature and interactions.", "weeks": 0.4},
                    {"name": "Quality checks", "detail": "Run mobile tests and performance checks.", "weeks": 0.2},
                    {"name": "Release", "detail": "Commit and push via workflow.", "weeks": 0.1},
                ]
            },
        }

    return {
        "title": f"{trend_title}: Monthly AI Feature",
        "trend_keyword": trend_title,
        "description": "Automatically generated feature from current trend data.",
        "why_now": "Trend data indicates high current interest, making it a useful candidate for quick product experiments.",
        "mobile_review_notes": "Built with responsive layout and mobile-safe controls.",
        "widget": widget,
        "commit_message": f"feat: add monthly AI feature for {sanitize_slug(trend_title)}",
    }


def build_prompt(top_trends: List[Dict[str, str]], geo: str, month_key: str) -> str:
    trends_text = json.dumps(top_trends[:12], ensure_ascii=False, indent=2)
    return f"""
Generate one portfolio-ready monthly feature from Google Trends data.

Hard constraints:
- Output ONLY valid JSON (no markdown).
- Language: English.
- Keep content professional and practical.
- Avoid politics, health, finance advice, or explicit content.
- Choose ONE trend from provided list.
- Prefer trends relevant to software, AI, developer productivity, data, or automation.

Return JSON with this exact top-level structure:
{{
  "title": "...",
  "trend_keyword": "...",
  "description": "...",
  "why_now": "...",
  "mobile_review_notes": "...",
  "widget": {{
    "type": "impact_estimator" | "tradeoff_matrix" | "roadmap_planner",
    "heading": "...",
    "description": "...",
    "config": {{ ... }}
  }},
  "commit_message": "feat: ..."
}}

Widget config requirements:
1) impact_estimator config:
{{
  "input_label": "...",
  "min": 0-100,
  "max": 1-100 and > min,
  "step": 1-20,
  "default": between min and max,
  "baseline_hours": 8-400,
  "efficiency_factor": 0.1-1.0
}}

2) tradeoff_matrix config:
{{
  "question": "...",
  "options": [
    {{"label": "...", "hint": "...", "scores": {{"outcome-id": 0-10, ...}}}}
  ],
  "outcomes": [
    {{"id": "...", "title": "...", "description": "..."}}
  ]
}}
- Provide 2-4 options and 2-4 outcomes.
- Option scores must reference each outcome id.

3) roadmap_planner config:
{{
  "steps": [
    {{"name": "...", "detail": "...", "weeks": 0.1-8.0}}
  ]
}}
- Provide 3-6 steps.

Context:
- Target month: {month_key}
- Region: {geo}
- Trends:
{trends_text}
""".strip()


def request_ai_feature_spec(api_key: str, base_url: str, model: str, prompt: str) -> Dict[str, Any]:
    url = base_url.rstrip("/") + "/chat/completions"
    body = {
        "model": model,
        "temperature": 0.3,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a senior product engineer. Produce clean, concise JSON following the requested schema."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    response = http_post_json(url, headers=headers, body=body)
    choices = response.get("choices") if isinstance(response, dict) else None
    if not choices:
        raise PipelineError("AI response does not contain choices.")

    content = choices[0].get("message", {}).get("content")
    if not content:
        raise PipelineError("AI response content is empty.")

    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        raise PipelineError(f"AI returned invalid JSON: {exc}") from exc


def finalize_feature(spec: Dict[str, Any], trends: List[Dict[str, str]], geo: str, month_key: str) -> Dict[str, Any]:
    top_trend = trends[0]["title"] if trends else "AI automation"
    title = normalize_string(spec.get("title"), f"{top_trend}: Monthly AI Feature", max_len=110)
    trend_keyword = normalize_string(spec.get("trend_keyword"), top_trend, max_len=80)
    if not any(hint in trend_keyword.lower() for hint in TECH_TREND_HINTS):
        for item in trends:
            candidate = normalize_string(item.get("title"), "", max_len=80)
            if candidate and any(hint in candidate.lower() for hint in TECH_TREND_HINTS):
                trend_keyword = candidate
                break
    if not any(hint in trend_keyword.lower() for hint in TECH_TREND_HINTS):
        trend_keyword = "AI automation"
    description = normalize_string(spec.get("description"), "Automatically generated feature from current trends.", max_len=280)
    why_now = normalize_string(spec.get("why_now"), "Trend signal is elevated this month.", max_len=280)
    mobile_notes = normalize_string(spec.get("mobile_review_notes"), "Built with responsive spacing and touch-friendly controls.", max_len=240)
    widget = normalize_widget(spec.get("widget"))

    slug = sanitize_slug(trend_keyword)
    feature_id = f"{month_key}-{slug}"

    feature = {
        "id": feature_id,
        "month": month_key,
        "title": title,
        "trend_keyword": trend_keyword,
        "description": description,
        "why_now": why_now,
        "mobile_review_notes": mobile_notes,
        "source": {
            "type": "google_trends",
            "geo": geo,
            "captured_at": utc_now().isoformat(),
        },
        "widget": widget,
    }

    commit_message = normalize_string(
        spec.get("commit_message"),
        f"feat: add monthly AI feature for {slug}",
        max_len=110,
    )

    return {
        "feature": feature,
        "commit_message": commit_message,
    }


def upsert_history(history: List[Dict[str, Any]], feature: Dict[str, Any]) -> List[Dict[str, Any]]:
    out = [h for h in history if not (isinstance(h, dict) and h.get("month") == feature.get("month"))]
    out.append(feature)
    out.sort(key=lambda item: str(item.get("month", "")))
    return out[-24:]


def build_test_file(feature: Dict[str, Any]) -> str:
    title = json.dumps(feature.get("title", ""))
    widget_type = json.dumps(feature.get("widget", {}).get("type", ""))

    interaction_block = """await expect(page.locator('#ai-monthly-feature-root .ai-widget')).toBeVisible();"""
    kind = feature.get("widget", {}).get("type")

    if kind == "impact_estimator":
        interaction_block = """
  const slider = page.locator('#ai-impact-slider');
  await expect(slider).toBeVisible();
  await slider.fill('80');
  await expect(page.locator('#ai-impact-stats')).toContainText('Saved Hours / Month');
        """.strip()
    elif kind == "tradeoff_matrix":
        interaction_block = """
  const options = page.locator('#ai-monthly-feature-root [data-tradeoff-index]');
  await expect(options.first()).toBeVisible();
  const count = await options.count();
  if (count > 1) {
    await options.nth(1).click();
  } else {
    await options.first().click();
  }
  await expect(page.locator('#ai-tradeoff-result')).not.toBeEmpty();
        """.strip()
    elif kind == "roadmap_planner":
        interaction_block = """
  const checks = page.locator('#ai-monthly-feature-root [data-roadmap-step]');
  await expect(checks.first()).toBeVisible();
  await checks.first().check();
  await expect(page.locator('#ai-roadmap-meta')).toContainText('complete');
        """.strip()

    content = f"""const {{ test, expect }} = require('@playwright/test');

test('AI monthly feature renders and works on mobile', async ({{ page }}) => {{
  await page.setViewportSize({{ width: 375, height: 812 }});

  const consoleErrors = [];
  page.on('console', (msg) => {{
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  }});
  page.on('pageerror', (err) => {{
    consoleErrors.push(String(err));
  }});

  await page.goto('/', {{ waitUntil: 'networkidle' }});

  await expect(page.locator('#ai-monthly-lab')).toBeVisible();
  await expect(page.locator('#ai-monthly-feature-root')).toContainText({title});

  const card = page.locator('#ai-monthly-feature-root .ai-feature');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('data-widget-type', {widget_type});

  {interaction_block}

  const hasHorizontalOverflow = await page.evaluate(() => {{
    const delta = document.documentElement.scrollWidth - window.innerWidth;
    return delta > 2;
  }});
  expect(hasHorizontalOverflow).toBeFalsy();

  expect(consoleErrors, `Console errors found: ${{consoleErrors.join('\\n')}}`).toEqual([]);
}});
"""
    return content


def build_brief_markdown(month_key: str, geo: str, trends: List[Dict[str, str]], feature: Dict[str, Any]) -> str:
    lines = [
        f"# Monthly AI Feature Brief ({month_key})",
        "",
        f"Region: {geo}",
        "",
        "## Selected Feature",
        f"- Title: {feature.get('title', '')}",
        f"- Trend keyword: {feature.get('trend_keyword', '')}",
        f"- Widget type: {feature.get('widget', {}).get('type', '')}",
        "",
        "## Top Trend Inputs",
    ]

    for item in trends[:10]:
        title = item.get("title", "")
        traffic = item.get("approx_traffic", "")
        pub_date = item.get("pub_date", "")
        lines.append(f"- {title} | traffic={traffic} | date={pub_date}")

    lines.append("")
    lines.append("## Rationale")
    lines.append(feature.get("why_now", ""))
    lines.append("")
    lines.append("## Mobile QA Note")
    lines.append(feature.get("mobile_review_notes", ""))
    lines.append("")
    return "\n".join(lines)


def run_pipeline(geo: str, force: bool, offline: bool) -> Tuple[Dict[str, Any], str]:
    ensure_dir(ARTIFACTS_DIR)
    month_key = utc_now().strftime("%Y-%m")

    history = read_json(FEATURE_HISTORY_FILE, fallback=[])
    if not isinstance(history, list):
        history = []

    existing_for_month = None
    for item in history:
        if isinstance(item, dict) and item.get("month") == month_key:
            existing_for_month = item
            break

    if existing_for_month is not None and not force:
        feature = existing_for_month
        commit_message = f"chore: monthly AI feature already exists for {month_key}"
        write_text(GENERATED_TEST_FILE, build_test_file(feature))
        write_json(CURRENT_FEATURE_FILE, feature)
        write_text(COMMIT_MSG_FILE, commit_message + "\n")
        brief = build_brief_markdown(month_key, geo, [], feature)
        write_text(BRIEF_FILE, brief)
        return feature, commit_message

    try:
        trends = fetch_google_trends(geo)
    except Exception as exc:
        print(f"[monthly-ai-feature] WARN: could not fetch Google Trends ({exc}). Using fallback trends.")
        trends = []
    if not trends:
        trends = [
            {"title": "AI agents", "approx_traffic": "", "pub_date": "", "link": ""},
            {"title": "developer productivity", "approx_traffic": "", "pub_date": "", "link": ""},
            {"title": "workflow automation", "approx_traffic": "", "pub_date": "", "link": ""},
        ]
    trends = prioritize_trends(trends)

    api_key = os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY")
    model = os.getenv("AI_MODEL") or os.getenv("OPENAI_MODEL") or DEFAULT_MODEL
    base_url = os.getenv("AI_BASE_URL") or DEFAULT_BASE_URL

    if offline or not api_key:
        spec = build_fallback_spec(trends, month_key)
    else:
        prompt = build_prompt(top_trends=trends, geo=geo, month_key=month_key)
        spec = request_ai_feature_spec(api_key=api_key, base_url=base_url, model=model, prompt=prompt)

    finalized = finalize_feature(spec=spec, trends=trends, geo=geo, month_key=month_key)
    feature = finalized["feature"]
    commit_message = finalized["commit_message"]

    updated_history = upsert_history(history=history, feature=feature)

    write_json(CURRENT_FEATURE_FILE, feature)
    write_json(FEATURE_HISTORY_FILE, updated_history)
    write_text(GENERATED_TEST_FILE, build_test_file(feature))
    write_text(COMMIT_MSG_FILE, commit_message + "\n")
    write_text(BRIEF_FILE, build_brief_markdown(month_key=month_key, geo=geo, trends=trends, feature=feature))

    return feature, commit_message


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate monthly AI feature from trends and update site assets.")
    parser.add_argument("--geo", default=os.getenv("GOOGLE_TRENDS_GEO", "KZ"), help="Google Trends region (default: KZ).")
    parser.add_argument("--force", action="store_true", help="Regenerate even if current month already exists in history.")
    parser.add_argument("--offline", action="store_true", help="Skip AI call and use deterministic fallback generation.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        feature, commit_message = run_pipeline(geo=args.geo, force=args.force, offline=args.offline)
    except Exception as exc:
        print(f"[monthly-ai-feature] ERROR: {exc}", file=sys.stderr)
        return 1

    print("[monthly-ai-feature] Updated feature:")
    print(json.dumps(feature, ensure_ascii=False, indent=2))
    print(f"[monthly-ai-feature] Suggested commit message: {commit_message}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
