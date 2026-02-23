"""
Three implementations of the same transformation for benchmarking.

Transformation: fee = amount * fee_rate

  1. slow_pipeline:   pure Python loop (baseline)
  2. fast_pipeline:   NumPy vectorized (recommended)
  3. parallel_loader: concurrent file loading with ThreadPoolExecutor
"""
import cProfile
import io
import pstats
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import numpy as np
import pandas as pd


# ---------------------------------------------------------------------------
# 1. Slow: pure Python loop
# ---------------------------------------------------------------------------

def slow_pipeline(df: pd.DataFrame) -> list:
    """Compute fee for each row using a Python for-loop."""
    results = []
    for _, row in df.iterrows():
        # iterrows() + Python float math per row is slow.
        fee = row["amount"] * row["fee_rate"]
        results.append(fee)
    return results


# ---------------------------------------------------------------------------
# 2. Fast: NumPy vectorization
# ---------------------------------------------------------------------------

def fast_pipeline(df: pd.DataFrame) -> np.ndarray:
    """Compute fee for all rows in one NumPy operation."""
    # .values gives a NumPy array; multiplication is a single C call.
    return df["amount"].values * df["fee_rate"].values


# ---------------------------------------------------------------------------
# 3. Parallel I/O with ThreadPoolExecutor
# ---------------------------------------------------------------------------

def _load_chunk(path: str) -> pd.DataFrame:
    """Load one CSV file (or chunk). Simulates I/O-bound work."""
    return pd.read_csv(path)


def parallel_loader(paths: list[str], max_workers: int = 4) -> list[pd.DataFrame]:
    """
    Load multiple files in parallel using threads.

    Threads are safe here because pd.read_csv releases the GIL during I/O.
    """
    results = [None] * len(paths)
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(_load_chunk, p): i for i, p in enumerate(paths)}
        for future in as_completed(futures):
            idx = futures[future]
            results[idx] = future.result()
    return results


# ---------------------------------------------------------------------------
# Profiling helper
# ---------------------------------------------------------------------------

def profile_function(func, *args, top_n: int = 10) -> str:
    """
    Run func(*args) under cProfile and return a formatted stats string.

    Args:
        func:  callable to profile.
        args:  positional arguments for func.
        top_n: number of top functions to show (sorted by cumulative time).

    Returns:
        Formatted stats string.
    """
    profiler = cProfile.Profile()
    profiler.enable()
    func(*args)
    profiler.disable()

    stream = io.StringIO()
    stats = pstats.Stats(profiler, stream=stream)
    stats.sort_stats("cumulative")
    stats.print_stats(top_n)
    return stream.getvalue()


# ---------------------------------------------------------------------------
# Benchmark runner
# ---------------------------------------------------------------------------

def benchmark(df: pd.DataFrame):
    """Compare slow vs. fast pipeline and print results."""
    print(f"Rows: {len(df):,}")

    # --- Slow (use a small subset to keep demo time reasonable) ---
    sample_df = df.head(50_000)
    t0 = time.perf_counter()
    slow_result = slow_pipeline(sample_df)
    t_slow = time.perf_counter() - t0
    print(f"\nSlow pipeline (Python loop, 50K rows):  {t_slow * 1000:.1f} ms")

    # --- Fast (full dataset) ---
    t0 = time.perf_counter()
    fast_result = fast_pipeline(df)
    t_fast = time.perf_counter() - t0
    print(f"Fast pipeline (NumPy, {len(df):,} rows):      {t_fast * 1000:.1f} ms")

    # Compare on the same 50K subset for fairness.
    t0 = time.perf_counter()
    fast_sample = fast_pipeline(sample_df)
    t_fast_sample = time.perf_counter() - t0
    speedup = t_slow / max(t_fast_sample, 1e-9)
    print(f"Speedup: {speedup:.1f}×")

    # Verify results match (within floating-point tolerance).
    assert np.allclose(slow_result, fast_sample, rtol=1e-5), "Results differ!"
    print("Results match ✓")


def main():
    import generate_data
    generate_data.generate()

    print("Loading data …")
    df = pd.read_csv("transactions.csv")

    print("\n=== Profiling slow pipeline (first 10K rows) ===")
    profile_output = profile_function(slow_pipeline, df.head(10_000))
    print(profile_output[:2000])

    print("\n=== Benchmark ===")
    benchmark(df)

    print("\n=== Parallel loader (simulated multi-file) ===")
    chunk_size = len(df) // 4
    paths = []
    for i in range(4):
        chunk_path = f"chunk_{i}.csv"
        df.iloc[i * chunk_size:(i + 1) * chunk_size].to_csv(chunk_path, index=False)
        paths.append(chunk_path)

    t0 = time.perf_counter()
    frames = parallel_loader(paths)
    t_parallel = time.perf_counter() - t0
    total_rows = sum(len(f) for f in frames)
    print(f"Loaded {total_rows:,} rows in {t_parallel * 1000:.1f} ms (4 threads)")


if __name__ == "__main__":
    main()
