"""Generate a deterministic sales CSV for the Postgres demo."""
import csv
import random
from datetime import date, timedelta
from pathlib import Path

SEED = 42
random.seed(SEED)

ROWS = 500_000
OUTPUT = Path("sales.csv")


def generate():
    start = date(2024, 1, 1)
    with OUTPUT.open("w", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["id", "customer_id", "product_id", "amount", "created_at"])
        for i in range(1, ROWS + 1):
            day_offset = random.randint(0, 729)   # 2 years of data
            writer.writerow([
                i,
                random.randint(1, 10_000),
                random.randint(1, 500),
                round(random.uniform(1.0, 9999.0), 2),
                start + timedelta(days=day_offset),
            ])
    print(f"Generated {ROWS} rows → {OUTPUT}")


if __name__ == "__main__":
    generate()
