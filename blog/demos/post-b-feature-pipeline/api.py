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
