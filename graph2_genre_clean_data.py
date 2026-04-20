"""
Graph 2 Genre Data Cleaning Script
====================================
Input:  netflix_titles_clean.csv
Output: graph2_genre_data.csv

Produces genre breakdown per country for the right-panel bar chart
in Graph 2. Only the 8 genres shown in the visualization are kept.

Steps:
  1. Extract primary country; filter to same top-10 as graph2_data.csv
  2. Explode listed_in so each row has one genre
  3. Filter to the 8 genres used in the visualization
  4. Count genre appearances per country
  5. Compute percentage out of total genre appearances per country
  6. Save long-format CSV (country, genre, count, pct)
"""

import pandas as pd

INPUT_PATH  = "netflix_titles_clean.csv"
OUTPUT_PATH = "graph2_genre_data.csv"

GENRES = [
    "Action & Adventure",
    "Children & Family Movies",
    "Comedies",
    "Dramas",
    "Independent Movies",
    "International Movies",
    "Romantic Movies",
    "Thrillers",
]

# ── 1. Load & filter to top-10 countries (mirrors graph2_clean_data.py) ───────
df = pd.read_csv(INPUT_PATH)
df["country_primary"] = df["country"].str.split(",").str[0].str.strip()
top10 = df["country_primary"].value_counts().head(10).index.tolist()
df = df[df["country_primary"].isin(top10)]

# ── 2. Explode genres ─────────────────────────────────────────────────────────
df["genre"] = df["listed_in"].str.split(", ")
exploded = df.explode("genre")
exploded["genre"] = exploded["genre"].str.strip()

# ── 3. Filter to the 8 visualization genres ───────────────────────────────────
exploded = exploded[exploded["genre"].isin(GENRES)]

# ── 4. Count genre appearances per country ────────────────────────────────────
counts = (
    exploded.groupby(["country_primary", "genre"])
    .size()
    .reset_index(name="count")
    .rename(columns={"country_primary": "country"})
)

# ── 5. Compute percentage out of total genre appearances per country ──────────
totals = counts.groupby("country")["count"].sum().rename("total")
counts = counts.join(totals, on="country")
counts["pct"] = (counts["count"] / counts["total"] * 100).round(1)
counts = counts.drop(columns="total")

# ── 6. Sort to match country order in graph2_data.csv ────────────────────────
country_order = (
    df.groupby("country_primary").size()
    .sort_values(ascending=False)
    .index.tolist()
)
counts["country"] = pd.Categorical(counts["country"], categories=country_order, ordered=True)
counts = counts.sort_values(["country", "genre"]).reset_index(drop=True)

counts.to_csv(OUTPUT_PATH, index=False)
print(f"Saved → {OUTPUT_PATH}  ({len(counts)} rows)")
print(counts.to_string(index=False))
