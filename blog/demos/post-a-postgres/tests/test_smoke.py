"""Integration smoke test: verify Postgres is reachable and the demo ran."""
import os

import psycopg2
import pytest

DSN = os.getenv(
    "DATABASE_URL",
    "postgresql://demo:demo@localhost:5432/demodb",
)


@pytest.mark.integration
def test_postgres_is_reachable():
    """Postgres must accept a connection and respond to a simple query."""
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    cur.execute("SELECT 1;")
    assert cur.fetchone() == (1,)
    cur.close()
    conn.close()


@pytest.mark.integration
def test_sales_table_has_rows():
    """The sales table must contain at least one row after the demo runs."""
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM sales;")
    count = cur.fetchone()[0]
    assert count > 0, "sales table is empty — did the demo run?"
    cur.close()
    conn.close()
