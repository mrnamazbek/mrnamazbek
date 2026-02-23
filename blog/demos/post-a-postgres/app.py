"""
Postgres query-optimization demo.

Steps:
  1. Create the sales table.
  2. Load sample data from CSV.
  3. Run a slow query and show its plan (Seq Scan).
  4. Add a B-tree index and show the improved plan (Index Scan).
  5. Create a partitioned version and show partition pruning.
"""
import os
import time

import psycopg2

DSN = os.getenv(
    "DATABASE_URL",
    "postgresql://demo:demo@localhost:5432/demodb",
)


def connect():
    return psycopg2.connect(DSN)


def setup_table(cur):
    """Drop and recreate the plain sales table."""
    cur.execute("DROP TABLE IF EXISTS sales CASCADE;")
    cur.execute("""
        CREATE TABLE sales (
            id           BIGINT PRIMARY KEY,
            customer_id  INT    NOT NULL,
            product_id   INT    NOT NULL,
            amount       NUMERIC(12, 2) NOT NULL,
            created_at   DATE   NOT NULL
        );
    """)


def load_csv(cur, path: str = "sales.csv"):
    """Bulk-load from CSV using COPY for maximum speed."""
    with open(path) as fh:
        next(fh)  # skip header
        cur.copy_expert(
            "COPY sales (id, customer_id, product_id, amount, created_at) FROM STDIN CSV",
            fh,
        )


def run_query(cur, label: str):
    """Run a sample query and return wall time + plan."""
    query = """
        SELECT customer_id, SUM(amount) AS total
        FROM sales
        WHERE created_at BETWEEN '2026-01-01' AND '2026-01-31'
        GROUP BY customer_id
        ORDER BY total DESC
        LIMIT 10;
    """
    # Capture the EXPLAIN ANALYZE output.
    cur.execute(f"EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) {query}")
    plan_lines = [row[0] for row in cur.fetchall()]

    t0 = time.perf_counter()
    cur.execute(query)
    cur.fetchall()
    elapsed = time.perf_counter() - t0

    print(f"\n=== {label} ===")
    print("\n".join(plan_lines[:8]))  # print first 8 lines of the plan
    print(f"Wall time: {elapsed * 1000:.1f} ms")
    return elapsed


def add_index(cur):
    """Add a B-tree index on the date column."""
    cur.execute("CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales (created_at);")


def setup_partitioned_table(cur):
    """Create a range-partitioned version for 2024–2026."""
    cur.execute("DROP TABLE IF EXISTS sales_p CASCADE;")
    cur.execute("""
        CREATE TABLE sales_p (
            id           BIGINT,
            customer_id  INT    NOT NULL,
            product_id   INT    NOT NULL,
            amount       NUMERIC(12, 2) NOT NULL,
            created_at   DATE   NOT NULL
        ) PARTITION BY RANGE (created_at);
    """)
    # Create one partition per year.
    for year in (2024, 2025, 2026):
        cur.execute(f"""
            CREATE TABLE sales_p_{year}
            PARTITION OF sales_p
            FOR VALUES FROM ('{year}-01-01') TO ('{year + 1}-01-01');
        """)


def copy_to_partitioned(cur):
    """Copy data from the plain table into the partitioned one."""
    cur.execute("INSERT INTO sales_p SELECT * FROM sales;")


def run_query_partitioned(cur, label: str):
    """Same query but on the partitioned table."""
    query = """
        SELECT customer_id, SUM(amount) AS total
        FROM sales_p
        WHERE created_at BETWEEN '2026-01-01' AND '2026-01-31'
        GROUP BY customer_id
        ORDER BY total DESC
        LIMIT 10;
    """
    cur.execute(f"EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) {query}")
    plan_lines = [row[0] for row in cur.fetchall()]

    t0 = time.perf_counter()
    cur.execute(query)
    cur.fetchall()
    elapsed = time.perf_counter() - t0

    print(f"\n=== {label} ===")
    print("\n".join(plan_lines[:8]))
    print(f"Wall time: {elapsed * 1000:.1f} ms")
    return elapsed


def main():
    import sample_data
    sample_data.generate()

    conn = connect()
    conn.autocommit = True
    cur = conn.cursor()

    # Step 1 – plain table, no index
    setup_table(cur)
    load_csv(cur)
    t_seq = run_query(cur, "No index (Seq Scan)")

    # Step 2 – add index
    add_index(cur)
    t_idx = run_query(cur, "With B-tree index")

    # Step 3 – partitioned table
    setup_partitioned_table(cur)
    copy_to_partitioned(cur)
    t_part = run_query_partitioned(cur, "Partitioned table (pruning)")

    print(f"\nSpeedup (index vs seq): {t_seq / t_idx:.1f}×")
    print(f"Speedup (partition vs seq): {t_seq / t_part:.1f}×")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
