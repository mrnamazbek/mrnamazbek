#!/usr/bin/env python3
"""Export the latest posts of a public Telegram channel to assets/telegram_posts.json.

Uses the public web preview https://t.me/s/<channel>: no API key, no login.
If the preview is empty or unavailable, the previous JSON file is kept untouched.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import urllib.request
from datetime import UTC, datetime
from pathlib import Path

DEFAULT_OUT = Path(__file__).resolve().parents[1] / "assets" / "telegram_posts.json"
MESSAGE_SPLIT = re.compile(r'(?=<div class="tgme_widget_message_wrap)')
POST_ID = re.compile(r'data-post="([^"]+)"')
TEXT = re.compile(r'class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', re.S)
TIME = re.compile(r'<time[^>]*datetime="([^"]+)"')
VIEWS = re.compile(r'class="tgme_widget_message_views">([^<]+)<')
TAGS = re.compile(r"<[^>]+>")


def clean(fragment: str) -> str:
    fragment = re.sub(r"<br\s*/?>", "\n", fragment)
    return html.unescape(TAGS.sub("", fragment)).strip()


def parse(page: str, limit: int = 12) -> list[dict]:
    posts = []
    for block in MESSAGE_SPLIT.split(page):
        post_id, text = POST_ID.search(block), TEXT.search(block)
        if not post_id or not text:
            continue
        stamp, views = TIME.search(block), VIEWS.search(block)
        posts.append(
            {
                "id": post_id.group(1),
                "url": f"https://t.me/{post_id.group(1)}",
                "text": clean(text.group(1)),
                "date": stamp.group(1) if stamp else None,
                "views": views.group(1).strip() if views else None,
            }
        )
    return list(reversed(posts))[:limit]  # newest first


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--channel", default="tech_digest_kz")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    request = urllib.request.Request(
        f"https://t.me/s/{args.channel}", headers={"User-Agent": "Mozilla/5.0 (site-feed)"}
    )
    with urllib.request.urlopen(request, timeout=30) as response:  # noqa: S310
        page = response.read().decode("utf-8", errors="replace")

    posts = parse(page)
    if not posts:
        print("No public posts found; keeping the existing file.", file=sys.stderr)
        return 0
    payload = {
        "channel": args.channel,
        "updated": datetime.now(UTC).isoformat(timespec="seconds"),
        "posts": posts,
    }
    args.out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {len(posts)} posts to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
