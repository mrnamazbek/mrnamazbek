"""Generate a large deterministic CSV for the performance demo."""
import csv
import random
from pathlib import Path

SEED = 42
random.seed(SEED)

ROWS = 1_000_000
OUTPUT = Path("transactions.csv")


def generate():
    with OUTPUT.open("w", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["transaction_id", "amount", "fee_rate"])
        for i in range(1, ROWS + 1):
            writer.writerow([
                i,
                round(random.uniform(1.0, 10_000.0), 2),
                round(random.uniform(0.001, 0.05), 4),
            ])
    print(f"Generated {ROWS} rows → {OUTPUT}")


if __name__ == "__main__":
    generate()
