"""Unit tests for the Postgres query-optimization demo."""
import csv
import sys
from pathlib import Path

import pytest

# Make sample_data importable from the parent directory.
sys.path.insert(0, str(Path(__file__).parent.parent))

import sample_data


def test_generate_creates_file(tmp_path, monkeypatch):
    """generate() must create a CSV file with a header and ROWS rows."""
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(sample_data, "OUTPUT", tmp_path / "sales.csv")
    monkeypatch.setattr(sample_data, "ROWS", 100)  # keep test fast

    sample_data.generate()

    out = tmp_path / "sales.csv"
    assert out.exists()
    with out.open() as fh:
        rows = list(csv.reader(fh))
    # Header + 100 data rows
    assert len(rows) == 101
    assert rows[0] == ["id", "customer_id", "product_id", "amount", "created_at"]


def test_row_values_in_range(tmp_path, monkeypatch):
    """All generated rows must have valid numeric values."""
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(sample_data, "OUTPUT", tmp_path / "sales.csv")
    monkeypatch.setattr(sample_data, "ROWS", 50)

    sample_data.generate()

    with (tmp_path / "sales.csv").open() as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            assert 1 <= int(row["customer_id"]) <= 10_000
            assert 1.0 <= float(row["amount"]) <= 9999.0
