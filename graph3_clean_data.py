"""
Graph 3 Data Cleaning Script
==============================
Input:  netflix_titles_clean.csv
Output: graph3_data.csv

Steps:
  1. Explode listed_in so each row has one genre
  2. Derive top 8 genres dynamically by total count
  3. Filter to valid maturity ratings
  4. Count titles per genre/rating combination
  5. Fill missing genre/rating combos with 0
  6. Calculate % of each genre's total per rating
  7. Save to graph3_data.csv
"""

import pandas as pd
from itertools import product

INPUT_PATH  = "netflix_titles_clean.csv"
OUTPUT_PATH = "graph3_data.csv"

VALID_RATINGS = ["G", "TV-G", "PG", "TV-Y", "TV-Y7", "TV-PG",
                 "PG-13", "TV-14", "R", "TV-MA", "NR"]

# ── 1. Load ───────────────────────────────────────────────────────────────────
df = pd.read_csv(INPUT_PATH)
print(f"Loaded {len(df):,} rows")

# ── 2. Explode genres ─────────────────────────────────────────────────────────
df["genre"] = df["listed_in"].str.split(", ")
exploded = df.explode("genre")
exploded["genre"] = exploded["genre"].str.strip()

# ── 3. Derive top 8 genres dynamically ───────────────────────────────────────
top_genres = exploded["genre"].value_counts().head(8).index.tolist()
print(f"  → Top 8 genres: {top_genres}")

# ── 4. Filter to top genres and valid ratings ─────────────────────────────────
sub = exploded[
    exploded["genre"].isin(top_genres) &
    exploded["rating"].isin(VALID_RATINGS)
]

# ── 5. Count titles per genre/rating ─────────────────────────────────────────
counts = sub.groupby(["genre", "rating"]).size().reset_index(name="count")

# ── 6. Fill missing combos with 0 ────────────────────────────────────────────
all_combos = pd.DataFrame(
    list(product(top_genres, VALID_RATINGS)),
    columns=["genre", "rating"]
)
counts = all_combos.merge(counts, on=["genre", "rating"], how="left").fillna(0)
counts["count"] = counts["count"].astype(int)

# ── 7. Calculate % of genre total ────────────────────────────────────────────
totals = counts.groupby("genre")["count"].transform("sum")
counts["pct"] = (counts["count"] / totals.replace(0, 1) * 100).round(1)

print(f"\nFinal graph3_data.csv preview:")
print(counts.head(11).to_string(index=False))

# ── 8. Save ───────────────────────────────────────────────────────────────────
counts.to_csv(OUTPUT_PATH, index=False)
print(f"\nSaved → {OUTPUT_PATH}  ({len(counts)} rows)")
