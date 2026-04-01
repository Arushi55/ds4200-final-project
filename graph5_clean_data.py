"""
Graph 5 Data Cleaning Script
==============================
Input:  netflix_titles_clean.csv
Output: graph5_data.csv

Steps:
  1. Extract primary country (first listed)
  2. Explode listed_in so each row has one genre
  3. Derive top 10 countries and top 8 genres dynamically
  4. Count titles per country/genre combination
  5. Calculate % of each country's total output per genre
  6. Save to graph5_data.csv
"""

import pandas as pd

INPUT_PATH  = "netflix_titles_clean.csv"
OUTPUT_PATH = "graph5_data.csv"

# ── 1. Load ───────────────────────────────────────────────────────────────────
df = pd.read_csv(INPUT_PATH)
print(f"Loaded {len(df):,} rows")

# ── 2. Extract primary country ────────────────────────────────────────────────
df["country_primary"] = df["country"].str.split(",").str[0].str.strip()

# ── 3. Explode genres ─────────────────────────────────────────────────────────
df["genre"] = df["listed_in"].str.split(", ")
exploded = df.explode("genre")
exploded["genre"] = exploded["genre"].str.strip()

# ── 4. Derive top 10 countries and top 8 genres dynamically ──────────────────
top_countries = (
    exploded["country_primary"]
    .value_counts()
    .head(10)
    .index.tolist()
)
top_genres = (
    exploded["genre"]
    .value_counts()
    .head(8)
    .index.tolist()
)
print(f"  → Top 10 countries: {top_countries}")
print(f"  → Top 8 genres:     {top_genres}")

# ── 5. Filter and count ───────────────────────────────────────────────────────
sub = exploded[
    exploded["country_primary"].isin(top_countries) &
    exploded["genre"].isin(top_genres)
]
counts = (
    sub.groupby(["country_primary", "genre"])
    .size()
    .reset_index(name="count")
    .rename(columns={"country_primary": "country"})
)

# ── 6. Calculate % of each country's total output ────────────────────────────
totals = counts.groupby("country")["count"].transform("sum")
counts["pct"] = (counts["count"] / totals * 100).round(1)

print(f"\nFinal graph5_data.csv preview:")
print(counts.head(8).to_string(index=False))

# ── 7. Save ───────────────────────────────────────────────────────────────────
counts.to_csv(OUTPUT_PATH, index=False)
print(f"\nSaved → {OUTPUT_PATH}  ({len(counts)} rows)")
