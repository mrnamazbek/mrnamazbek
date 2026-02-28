#!/usr/bin/env python3
"""
Validate JSON data files used by the portfolio site.
Run from project root: python scripts/validate_site_data.py
"""
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ASSETS = PROJECT_ROOT / "assets"

FILES = [
    "books.json",
    "mock_repos.json",
    "ai_monthly_feature.json",
    "keywords.json",
    "db_ranking.json",
]


def validate() -> bool:
    ok = True
    for name in FILES:
        path = ASSETS / name
        if not path.exists():
            print(f"  skip  {name} (not found)")
            continue
        try:
            with open(path, encoding="utf-8") as f:
                json.load(f)
            print(f"  ok    {name}")
        except json.JSONDecodeError as e:
            print(f"  fail  {name}: {e}")
            ok = False
    return ok


if __name__ == "__main__":
    print("Validating site JSON data...")
    if validate():
        print("Done.")
        sys.exit(0)
    sys.exit(1)
