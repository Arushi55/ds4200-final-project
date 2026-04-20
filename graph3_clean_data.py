"""
Graph 3 Data Cleaning Script (updated)
========================================
Input:  netflix_titles_clean.csv
Output: graph3_data.csv

Change: now produces country vs maturity rating
(instead of genre vs maturity rating)

Steps:
  1. Extract primary country
  2. Filter to top 10 countries and valid ratings
  3. Count titles per country/rating combination
  4. Fill missing combos with 0
  5. Calculate pct of each country total per rating
  6. Save to graph3_data.csv
"""

import pandas as pd
from itertools import product

INPUT_PATH  = "netflix_titles_clean.csv"
OUTPUT_PATH = "graph3_data.csv"

VALID_RATINGS = ["G","TV-G","PG","TV-Y","TV-Y7","TV-PG","PG-13","TV-14","R","TV-MA","NR"]

df = pd.read_csv(INPUT_PATH)
print(f"Loaded {len(df):,} rows")

df["country_primary"] = df["country"].str.split(",").str[0].str.strip()

top_countries = (
    df[df["country_primary"] != "Unknown"]["country_primary"]
    .value_counts().head(10).index.tolist()
)
print(f"  Top 10 countries: {top_countries}")

sub = df[
    df["country_primary"].isin(top_countries) &
    df["rating"].isin(VALID_RATINGS)
]
counts = (
    sub.groupby(["country_primary","rating"])
    .size().reset_index(name="count")
    .rename(columns={"country_primary":"country"})
)

all_combos = pd.DataFrame(
    list(product(top_countries, VALID_RATINGS)),
    columns=["country","rating"]
)
counts = all_combos.merge(counts, on=["country","rating"], how="left").fillna(0)
counts["count"] = counts["count"].astype(int)

totals = counts.groupby("country")["count"].transform("sum")
counts["pct"] = (counts["count"] / totals.replace(0,1) * 100).round(1)

counts.to_csv(OUTPUT_PATH, index=False)
print(f"Saved -> {OUTPUT_PATH}  ({len(counts)} rows)")
