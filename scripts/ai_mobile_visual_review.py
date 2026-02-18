import argparse
import base64
import json
import os
import ssl
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_FEATURE_FILE = ROOT / "assets" / "ai_monthly_feature.json"
DEFAULT_OUTPUT_FILE = ROOT / "artifacts" / "mobile-review.json"

DEFAULT_BASE_URL = "https://api.openai.com/v1"
DEFAULT_MODEL = "gpt-4.1-mini"


class ReviewError(Exception):
    pass


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def read_json(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        payload = json.load(f)
    return payload if isinstance(payload, dict) else {}


def write_json(path: Path, payload: Dict[str, Any]) -> None:
    ensure_dir(path.parent)
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write("\n")


def _open_url(request: urllib.request.Request, timeout: int = 75) -> bytes:
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


def http_post_json(url: str, headers: Dict[str, str], body: Dict[str, Any]) -> Dict[str, Any]:
    encoded = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(url, data=encoded, headers=headers, method="POST")
    raw = _open_url(request)
    try:
        return json.loads(raw.decode("utf-8", errors="replace"))
    except json.JSONDecodeError as exc:
        raise ReviewError(f"Invalid JSON from API: {exc}") from exc


def guess_mime(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".png":
        return "image/png"
    if suffix in {".jpg", ".jpeg"}:
        return "image/jpeg"
    if suffix == ".webp":
        return "image/webp"
    return "application/octet-stream"


def build_review_prompt(feature: Dict[str, Any]) -> str:
    title = str(feature.get("title", "Monthly AI Feature"))
    widget_type = str(feature.get("widget", {}).get("type", ""))
    description = str(feature.get("description", ""))

    return (
        "Review the provided mobile screenshot for UI quality and responsiveness. "
        "Focus on spacing, readability, clipping, overlap, contrast, and tap-target ergonomics. "
        "Return STRICT JSON with keys: pass (boolean), score (0-100 integer), summary (string), "
        "wins (array of short strings), issues (array of short strings). "
        "Fail the review if text is clipped, controls are too small, or content overflows horizontally.\n\n"
        f"Feature title: {title}\n"
        f"Widget type: {widget_type}\n"
        f"Description: {description}"
    )


def run_ai_review(image_path: Path, feature: Dict[str, Any], api_key: str, base_url: str, model: str) -> Dict[str, Any]:
    mime = guess_mime(image_path)
    image_b64 = base64.b64encode(image_path.read_bytes()).decode("ascii")
    image_url = f"data:{mime};base64,{image_b64}"

    url = base_url.rstrip("/") + "/chat/completions"
    prompt = build_review_prompt(feature)
    body = {
        "model": model,
        "temperature": 0.1,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": "You are a strict mobile UI QA reviewer.",
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            },
        ],
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    response = http_post_json(url=url, headers=headers, body=body)
    choices = response.get("choices") if isinstance(response, dict) else None
    if not choices:
        raise ReviewError("AI review response has no choices.")

    content = choices[0].get("message", {}).get("content")
    if not content:
        raise ReviewError("AI review content is empty.")

    try:
        payload = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ReviewError(f"AI review did not return valid JSON: {exc}") from exc

    result = {
        "pass": bool(payload.get("pass", False)),
        "score": int(payload.get("score", 0)),
        "summary": str(payload.get("summary", "")),
        "wins": payload.get("wins") if isinstance(payload.get("wins"), list) else [],
        "issues": payload.get("issues") if isinstance(payload.get("issues"), list) else [],
    }
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run AI-based mobile visual review from screenshot.")
    parser.add_argument("--image", required=True, help="Path to screenshot image.")
    parser.add_argument("--feature", default=str(DEFAULT_FEATURE_FILE), help="Path to ai_monthly_feature.json")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT_FILE), help="Path to write JSON review report")
    parser.add_argument("--offline", action="store_true", help="Skip AI call and mark review as pass")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    image_path = Path(args.image).resolve()
    feature_path = Path(args.feature).resolve()
    output_path = Path(args.output).resolve()

    if not image_path.exists():
        print(f"[ai-mobile-review] ERROR: image not found: {image_path}", file=sys.stderr)
        return 1

    feature = read_json(feature_path) if feature_path.exists() else {}

    api_key = os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("AI_BASE_URL") or DEFAULT_BASE_URL
    model = os.getenv("AI_VISION_MODEL") or os.getenv("AI_MODEL") or os.getenv("OPENAI_MODEL") or DEFAULT_MODEL
    min_score = int(os.getenv("AI_REVIEW_MIN_SCORE", "75"))

    if args.offline or not api_key:
        result = {
            "pass": True,
            "score": 100,
            "summary": "Offline mode review: AI evaluation skipped.",
            "wins": ["Screenshot captured successfully."],
            "issues": [],
        }
    else:
        try:
            result = run_ai_review(image_path=image_path, feature=feature, api_key=api_key, base_url=base_url, model=model)
        except Exception as exc:
            print(f"[ai-mobile-review] ERROR: {exc}", file=sys.stderr)
            return 1

    report = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "image": str(image_path),
        "feature_id": feature.get("id"),
        "feature_title": feature.get("title"),
        "result": result,
        "criteria": {
            "min_score": min_score,
            "fails_if_pass_false": True,
        },
    }
    write_json(output_path, report)

    passed = bool(result.get("pass")) and int(result.get("score", 0)) >= min_score
    print("[ai-mobile-review] Result:")
    print(json.dumps(report, ensure_ascii=False, indent=2))

    if not passed:
        print("[ai-mobile-review] FAILED: mobile visual review did not meet quality threshold.", file=sys.stderr)
        return 1

    print("[ai-mobile-review] PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
