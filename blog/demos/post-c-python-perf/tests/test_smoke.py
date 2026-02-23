"""Smoke test: run the full pipeline and verify outputs are correct."""
import subprocess
import sys
from pathlib import Path

import pytest

DEMO_DIR = Path(__file__).parent.parent


@pytest.mark.integration
def test_pipeline_runs_without_error():
    """pipeline.py must exit with code 0."""
    result = subprocess.run(
        [sys.executable, "pipeline.py"],
        cwd=DEMO_DIR,
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert result.returncode == 0, f"Pipeline failed:\n{result.stderr}"


@pytest.mark.integration
def test_pipeline_reports_speedup():
    """pipeline.py stdout must mention 'Speedup'."""
    result = subprocess.run(
        [sys.executable, "pipeline.py"],
        cwd=DEMO_DIR,
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert "Speedup" in result.stdout, "Expected 'Speedup' in output"


@pytest.mark.integration
def test_pipeline_results_match():
    """pipeline.py stdout must confirm results match."""
    result = subprocess.run(
        [sys.executable, "pipeline.py"],
        cwd=DEMO_DIR,
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert "Results match" in result.stdout
