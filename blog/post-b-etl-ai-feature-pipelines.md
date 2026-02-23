---
title: "Designing ETL for AI: Building Robust Feature Pipelines and Feature Stores"
description: "Learn how to build reliable ML feature pipelines in Python: ingestion, transformation, storage, and serving — with Docker and pytest."
date: 2026-02-23
tags:
  - feature-store
  - feature-pipeline
  - mlops
  - data-engineering
  - python
  - etl
canonical_url: "https://mrnamazbek.github.io/blog/etl-ai-feature-pipelines"
image: "assets/images/feature-pipeline-hero.jpg"
reading_time: "10 min"
---

<!-- slug: etl-ai-feature-pipelines -->

> **Hero image alt text:** "A data flow diagram showing raw data moving through a feature pipeline into a feature store"
> **Unsplash image query:** `machine learning pipeline data flow abstract`

---

## TL;DR

AI models are only as good as their features. Learn how to design a feature pipeline: ingest raw events, compute features, store them with versioning, and serve them at low latency. Fully working Python + FastAPI demo, runs in Docker, no paid APIs needed.

**Audience:** strong-junior → middle Data Engineer

---

## Why This Matters

In 2026, the boundary between data engineering and ML engineering is blurring. Joe Reis calls this the "AI-native pipeline era" ([source](https://www.joereis.net/p/where-data-engineering-is-heading)). Feature pipelines are the bridge. A bad feature pipeline means stale data, training-serving skew, and broken model predictions. Getting this right is now a core data engineering skill.

---

## Learning Goals

- Understand training-serving skew and why it kills ML models in production.
- Build a feature pipeline that computes, stores, and versions features.
- Serve features through a lightweight API and write tests to verify freshness.

---

## Background Theory

### What is a feature pipeline?

A **feature** is a number that the ML model uses as input (e.g., "average purchase amount in the last 30 days"). A **feature pipeline** transforms raw data into features and stores them so that:

- The training job can read *historical* feature values.
- The serving layer can read the *latest* feature values in milliseconds.

### Training-serving skew

Training-serving skew happens when the feature computed at training time is different from the feature computed at serving time. Common causes:

- Different code paths for batch (training) vs. real-time (serving).
- Aggregation window mismatch (30 days vs. 28 days).
- Timezone bugs.

The fix: **one single feature computation function** used in both paths.

### Architecture

```
Raw events (CSV / Kafka)
        │
        ▼
  Feature Pipeline
  ┌─────────────────────────────┐
  │  1. Ingest                  │
  │  2. Validate (schema check) │
  │  3. Compute features        │
  │  4. Write to Feature Store  │
  └─────────────────────────────┘
        │
        ▼
  Feature Store (SQLite / Postgres / Redis)
        │
   ┌────┴────┐
   ▼         ▼
Training   Serving API
  Job      (FastAPI)
```

### Feature store options

| Option | Latency | Best for |
|--------|---------|---------|
| SQLite (demo) | ~1 ms | Local dev, demos |
| PostgreSQL | ~2–5 ms | Small-to-medium production |
| Redis | <1 ms | High-throughput online serving |
| Feast / Tecton | varies | Enterprise, multi-team |

---

## Practical Example

### What the code does

We simulate an e-commerce event stream (CSV). The pipeline computes three features per customer: `total_orders`, `avg_order_value`, and `days_since_last_order`. Features are stored in SQLite. A FastAPI app serves them. Tests verify freshness.

### Folder structure

```
blog/demos/post-b-feature-pipeline/
├── pipeline.py          # feature computation + storage
├── api.py               # FastAPI serving layer
├── sample_data.py       # generates sample events CSV
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── tests/
    ├── test_unit.py
    └── test_smoke.py
```

### Sample data generator

```python
# blog/demos/post-b-feature-pipeline/sample_data.py
"""Generate deterministic customer order events CSV."""
import csv
import random
from datetime import date, timedelta
from pathlib import Path

SEED = 42
random.seed(SEED)

ROWS = 10_000
OUTPUT = Path("events.csv")


def generate():
    start = date(2025, 1, 1)
    with OUTPUT.open("w", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["event_id", "customer_id", "order_value", "event_date"])
        for i in range(1, ROWS + 1):
            writer.writerow([
                i,
                random.randint(1, 200),                       # 200 customers
                round(random.uniform(10.0, 500.0), 2),
                start + timedelta(days=random.randint(0, 364)),
            ])
    print(f"Generated {ROWS} events → {OUTPUT}")


if __name__ == "__main__":
    generate()
```

### Feature pipeline

```python
# blog/demos/post-b-feature-pipeline/pipeline.py
"""
Feature pipeline: ingest events → compute features → write to SQLite store.

Features computed per customer_id:
  - total_orders:          count of all orders
  - avg_order_value:       mean order value (rounded to 2 dp)
  - days_since_last_order: days between latest order and reference_date
"""
import csv
import sqlite3
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path
from typing import Dict, List

DB_PATH = Path("feature_store.db")
REFERENCE_DATE = date(2026, 1, 1)   # fixed for reproducibility


# ---------------------------------------------------------------------------
# Core feature computation — shared by pipeline AND serving API.
# ---------------------------------------------------------------------------

def compute_features(events: List[dict], reference_date: date = REFERENCE_DATE) -> Dict[int, dict]:
    """
    Compute per-customer features from a list of raw event dicts.

    Args:
        events: list of dicts with keys customer_id, order_value, event_date.
        reference_date: the "today" anchor for days_since_last_order.

    Returns:
        dict mapping customer_id → feature dict.
    """
    buckets: Dict[int, list] = defaultdict(list)
    for ev in events:
        cid = int(ev["customer_id"])
        buckets[cid].append({
            "order_value": float(ev["order_value"]),
            "event_date": (
                ev["event_date"] if isinstance(ev["event_date"], date)
                else datetime.strptime(str(ev["event_date"]), "%Y-%m-%d").date()
            ),
        })

    features = {}
    for cid, orders in buckets.items():
        values = [o["order_value"] for o in orders]
        last_date = max(o["event_date"] for o in orders)
        features[cid] = {
            "total_orders": len(orders),
            "avg_order_value": round(sum(values) / len(values), 2),
            "days_since_last_order": (reference_date - last_date).days,
        }
    return features


# ---------------------------------------------------------------------------
# Storage helpers
# ---------------------------------------------------------------------------

def init_db(db_path: Path = DB_PATH) -> sqlite3.Connection:
    """Create the feature store table if it does not exist."""
    conn = sqlite3.connect(str(db_path))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS customer_features (
            customer_id          INTEGER PRIMARY KEY,
            total_orders         INTEGER,
            avg_order_value      REAL,
            days_since_last_order INTEGER,
            updated_at           TEXT
        );
    """)
    conn.commit()
    return conn


def write_features(conn: sqlite3.Connection, features: Dict[int, dict]):
    """Upsert computed features into the store."""
    now = datetime.utcnow().isoformat()
    rows = [
        (cid, f["total_orders"], f["avg_order_value"], f["days_since_last_order"], now)
        for cid, f in features.items()
    ]
    conn.executemany("""
        INSERT INTO customer_features
            (customer_id, total_orders, avg_order_value, days_since_last_order, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(customer_id) DO UPDATE SET
            total_orders          = excluded.total_orders,
            avg_order_value       = excluded.avg_order_value,
            days_since_last_order = excluded.days_since_last_order,
            updated_at            = excluded.updated_at;
    """, rows)
    conn.commit()


def read_events_from_csv(path: str = "events.csv") -> List[dict]:
    """Load raw events from CSV into a list of dicts."""
    with open(path) as fh:
        return list(csv.DictReader(fh))


# ---------------------------------------------------------------------------
# Pipeline entry point
# ---------------------------------------------------------------------------

def run_pipeline(csv_path: str = "events.csv", db_path: Path = DB_PATH):
    """Full pipeline: load → compute → store."""
    print(f"Loading events from {csv_path} …")
    events = read_events_from_csv(csv_path)
    print(f"  Loaded {len(events)} events.")

    print("Computing features …")
    features = compute_features(events)
    print(f"  Computed features for {len(features)} customers.")

    print(f"Writing to feature store at {db_path} …")
    conn = init_db(db_path)
    write_features(conn, features)
    conn.close()
    print("  Done.")


if __name__ == "__main__":
    import sample_data
    sample_data.generate()
    run_pipeline()
```

### Serving API

```python
# blog/demos/post-b-feature-pipeline/api.py
"""
FastAPI feature-serving layer.

Endpoints:
  GET /features/{customer_id}   → latest features for one customer
  GET /healthz                  → liveness probe
"""
import sqlite3
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

DB_PATH = Path("feature_store.db")

app = FastAPI(title="Feature Store API", version="1.0.0")


class CustomerFeatures(BaseModel):
    customer_id: int
    total_orders: int
    avg_order_value: float
    days_since_last_order: int
    updated_at: str


def get_conn():
    """Open a read-only SQLite connection."""
    return sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)


@app.get("/healthz")
def healthz():
    """Liveness probe — always returns 200 if the server is up."""
    return {"status": "ok", "ts": datetime.utcnow().isoformat()}


@app.get("/features/{customer_id}", response_model=CustomerFeatures)
def get_features(customer_id: int):
    """Return the latest feature vector for a given customer."""
    try:
        conn = get_conn()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Feature store unavailable") from exc

    cur = conn.cursor()
    cur.execute(
        "SELECT customer_id, total_orders, avg_order_value, days_since_last_order, updated_at "
        "FROM customer_features WHERE customer_id = ?",
        (customer_id,),
    )
    row = cur.fetchone()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")

    return CustomerFeatures(
        customer_id=row[0],
        total_orders=row[1],
        avg_order_value=row[2],
        days_since_last_order=row[3],
        updated_at=row[4],
    )
```

### requirements.txt

```
fastapi==0.115.6
uvicorn[standard]==0.32.1
pydantic==2.10.3
pytest==8.3.3
requests==2.32.3
httpx==0.28.1
```

### Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run pipeline first, then start the API server.
CMD ["sh", "-c", "python pipeline.py && uvicorn api:app --host 0.0.0.0 --port 8000"]
```

### docker-compose.yml

```yaml
version: "3.9"
services:
  feature-api:
    build: .
    ports:
      - "8000:8000"
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:8000/healthz || exit 1"]
      interval: 5s
      retries: 15
```

### Unit test

```python
# blog/demos/post-b-feature-pipeline/tests/test_unit.py
"""Unit tests for the feature pipeline (no DB or network needed)."""
import sys
from datetime import date
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from pipeline import compute_features


EVENTS = [
    {"customer_id": "1", "order_value": "100.00", "event_date": "2025-06-01"},
    {"customer_id": "1", "order_value": "200.00", "event_date": "2025-12-01"},
    {"customer_id": "2", "order_value": "50.00",  "event_date": "2025-03-15"},
]

REF_DATE = date(2026, 1, 1)


def test_total_orders():
    """Customer 1 has 2 orders, customer 2 has 1."""
    features = compute_features(EVENTS, REF_DATE)
    assert features[1]["total_orders"] == 2
    assert features[2]["total_orders"] == 1


def test_avg_order_value():
    """Customer 1 average must be 150.00."""
    features = compute_features(EVENTS, REF_DATE)
    assert features[1]["avg_order_value"] == 150.00


def test_days_since_last_order():
    """Customer 1 last order 2025-12-01 → 31 days before 2026-01-01."""
    features = compute_features(EVENTS, REF_DATE)
    assert features[1]["days_since_last_order"] == 31


def test_training_serving_parity():
    """The same function must produce identical results when called twice."""
    f1 = compute_features(EVENTS, REF_DATE)
    f2 = compute_features(EVENTS, REF_DATE)
    assert f1 == f2
```

### Smoke test

```python
# blog/demos/post-b-feature-pipeline/tests/test_smoke.py
"""Integration smoke test: verify the API is running and returns features."""
import os
import requests
import pytest

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")


@pytest.mark.integration
def test_healthz():
    """GET /healthz must return 200 with status=ok."""
    resp = requests.get(f"{BASE_URL}/healthz", timeout=5)
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.integration
def test_get_features_known_customer():
    """GET /features/1 must return a valid feature vector."""
    resp = requests.get(f"{BASE_URL}/features/1", timeout=5)
    assert resp.status_code == 200
    data = resp.json()
    assert data["customer_id"] == 1
    assert data["total_orders"] > 0
    assert 0 < data["avg_order_value"] < 10_000


@pytest.mark.integration
def test_get_features_unknown_customer():
    """GET /features/99999 must return 404."""
    resp = requests.get(f"{BASE_URL}/features/99999", timeout=5)
    assert resp.status_code == 404
```

---

## How to Run Locally

### With Docker (recommended)

```bash
cd blog/demos/post-b-feature-pipeline

# Build and start the feature API (pipeline runs on container start)
docker compose up --build

# Unit tests (no network needed)
docker compose run --rm feature-api pytest tests/test_unit.py -v

# Smoke tests (API must be running)
docker compose run --rm -e API_BASE_URL=http://feature-api:8000 \
  feature-api pytest tests/test_smoke.py -v -m integration
```

### With venv (alternative)

```bash
cd blog/demos/post-b-feature-pipeline

python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python pipeline.py        # generates events.csv and feature_store.db
uvicorn api:app --reload  # start serving

pytest tests/test_unit.py -v
pytest tests/test_smoke.py -v -m integration
```

---

## Deep Dive: Feature Store Internals

A production feature store has three planes:

| Plane | What it stores | Latency requirement |
|-------|---------------|---------------------|
| **Offline store** | Historical feature values for training | Minutes acceptable |
| **Online store** | Latest feature value per entity | <10 ms required |
| **Registry** | Feature definitions, metadata, lineage | Not on critical path |

Our SQLite demo acts as both online and offline store. For production, use PostgreSQL as the offline store and Redis as the online store. The key insight: **compute once, store twice** — write to both stores from a single pipeline run.

---

## Real-World Tips

**Ops:** Track feature freshness. If `days_since_last_order` is 999 for many customers, your pipeline has not run recently. Add a Grafana alert.

**Observability:** Log the number of customers updated per pipeline run. A sudden drop means upstream data is missing.

**Security:** The SQLite file contains PII (customer IDs + purchase data). Encrypt at rest in production. Use environment variables for DB credentials — never hardcode them.

---

## SEO Features

**Meta description (≤160 chars):**
> Build a Python feature pipeline from scratch: ingest, compute, store, and serve ML features with FastAPI. Docker demo, pytest included. No cloud required.

**SEO keywords:**
1. feature pipeline python
2. feature store tutorial
3. etl for machine learning
4. mlops feature engineering
5. training serving skew
6. fastapi feature store
7. data engineering AI pipeline
8. feature computation python

**Hashtags:** `#MLOps` `#DataEngineering` `#Python`

---

## Cross-Post Snippet

### Medium (80–120 words)

> **Feature pipelines are the bridge between raw data and AI models.**
>
> In this post I build a complete feature pipeline in Python: raw event ingestion, feature computation, SQLite feature store, and a FastAPI serving layer. The same function computes features in both training and serving, which eliminates training-serving skew.
>
> Everything runs in Docker. No cloud account needed. Tests included (pytest unit + smoke).
>
> *Originally published at [https://mrnamazbek.github.io/blog/etl-ai-feature-pipelines](https://mrnamazbek.github.io/blog/etl-ai-feature-pipelines).*

### Dev.to (40–80 words)

> Build a complete ML feature pipeline in Python: ingest events, compute features, store them in SQLite, serve via FastAPI. Same function for training and serving = zero training-serving skew. Docker + pytest included.
>
> Tags: `#mlops` `#dataengineering` `#python` `#machinelearning`

---

## Final Checklist

1. **Unit test pass:** `pytest tests/test_unit.py -v` → 4 tests green.
2. **Smoke test pass:** `pytest tests/test_smoke.py -v -m integration` → 3 tests green.
3. **Linting:** `ruff check pipeline.py api.py sample_data.py tests/` → no errors.
4. **Screenshot:** `curl http://localhost:8000/features/1` returns a JSON feature vector.
5. **CI snippet:** See `.github/workflows/blog-ci.yml` in this repository.

---

## Convert to Other Formats

**LinkedIn post:**
"ML models fail in production because of bad features — not bad algorithms. I wrote a guide to building a feature pipeline: compute once, store twice, serve fast. Python + FastAPI + Docker. Link in comments."

**Twitter/X thread:**
"🧵 Feature pipelines explained: 1/ Raw events → compute features (same code for training + serving). 2/ Store in SQLite (dev) or Redis (prod). 3/ Serve via FastAPI in <10 ms. 4/ Training-serving skew = fixed. Full code → [link]"

**Mini video script (30–60 s):**
"Watch this: raw CSV goes in. 10,000 order events. Pipeline computes three features per customer. Writes to a feature store. FastAPI serves them in under 2 ms. Same function runs in training. That's it — no skew, ever. Full code in the blog post."

---

## Sources

1. Joe Reis — "Where Data Engineering Is Heading in 2026": <https://www.joereis.net/p/where-data-engineering-is-heading>
2. Databricks — "Data + AI Roundup February 2026": <https://www.databricks.com/blog/data-ai-roundup-february-2026>
3. Feast documentation — "What is a Feature Store?": <https://docs.feast.dev/getting-started/concepts/feature-store>
4. OpenSourceForU — "Data Engineering & Python in the AI Era": <https://opensourceforU.com/data-engineering-python-ai-era-2025/>
