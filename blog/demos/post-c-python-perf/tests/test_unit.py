"""Unit tests for the performance pipeline (no files or network needed)."""
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from pipeline import slow_pipeline, fast_pipeline, parallel_loader


def make_df(n: int = 1000) -> pd.DataFrame:
    """Create a small deterministic DataFrame for testing."""
    rng = np.random.default_rng(42)
    return pd.DataFrame({
        "amount": rng.uniform(1.0, 100.0, n),
        "fee_rate": rng.uniform(0.001, 0.05, n),
    })


def test_slow_and_fast_give_same_results():
    """slow_pipeline and fast_pipeline must produce identical results."""
    df = make_df(1000)
    slow = slow_pipeline(df)
    fast = fast_pipeline(df)
    assert np.allclose(slow, fast, rtol=1e-5)


def test_fast_pipeline_returns_numpy_array():
    """fast_pipeline must return a NumPy array."""
    df = make_df(100)
    result = fast_pipeline(df)
    assert isinstance(result, np.ndarray)


def test_fast_pipeline_length_matches_input():
    """Output length must equal input length."""
    df = make_df(500)
    result = fast_pipeline(df)
    assert len(result) == 500


def test_fast_pipeline_no_negative_fees():
    """All fees must be positive (amount > 0, fee_rate > 0)."""
    df = make_df(200)
    result = fast_pipeline(df)
    assert (result > 0).all()


def test_parallel_loader_total_rows(tmp_path):
    """parallel_loader must return all rows from multiple files."""
    df = make_df(200)
    p1 = str(tmp_path / "a.csv")
    p2 = str(tmp_path / "b.csv")
    df.iloc[:100].to_csv(p1, index=False)
    df.iloc[100:].to_csv(p2, index=False)

    frames = parallel_loader([p1, p2], max_workers=2)
    total = sum(len(f) for f in frames)
    assert total == 200
