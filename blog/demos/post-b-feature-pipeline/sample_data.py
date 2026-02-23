"""Generate deterministic customer order events CSV."""
import csv
import random
from datetime import date, timedelta
from pathlib import Path

SEED = 42
random.seed(SEED)

ROWS = 10_000
OUTPUT = Path("events.csv")


def generate():
    start = date(2025, 1, 1)
    with OUTPUT.open("w", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["event_id", "customer_id", "order_value", "event_date"])
        for i in range(1, ROWS + 1):
            writer.writerow([
                i,
                random.randint(1, 200),                       # 200 customers
                round(random.uniform(10.0, 500.0), 2),
                start + timedelta(days=random.randint(0, 364)),
            ])
    print(f"Generated {ROWS} events → {OUTPUT}")


if __name__ == "__main__":
    generate()
