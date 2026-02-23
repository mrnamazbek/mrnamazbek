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
