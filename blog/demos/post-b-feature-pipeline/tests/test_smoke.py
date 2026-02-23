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
