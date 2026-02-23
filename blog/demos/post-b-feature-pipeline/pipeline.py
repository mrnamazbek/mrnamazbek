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
