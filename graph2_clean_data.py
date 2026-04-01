"""
Graph 2 Data Cleaning Script
==============================
Input:  netflix_titles_clean.csv
Output: graph2_data.csv

Steps:
  1. Extract the primary (first-listed) country from the `country` column
  2. Identify the top 10 countries by total title count (Unknown retained)
  3. Filter to only those top 10 countries
  4. Count Movies and TV Shows per country
  5. Sort by total descending
  6. Reshape to long format (one row per country+type) for D3
"""

import pandas as pd

INPUT_PATH  = "netflix_titles_clean.csv"
OUTPUT_PATH = "graph2_data.csv"

# ── 1. Load ───────────────────────────────────────────────────────────────────
df = pd.read_csv(INPUT_PATH)
print(f"Loaded {len(df):,} rows")

# ── 2. Extract primary country ────────────────────────────────────────────────
# Some rows have multiple countries (e.g. "United States, India") — take the first
df["country_primary"] = df["country"].str.split(",").str[0].str.strip()
print(f"  → {(df['country_primary'] == 'Unknown').sum()} rows with Unknown country")

# ── 3. Top 10 countries by total title count (Unknown included) ───────────────
# "Unknown" is retained so the chart accurately reflects titles with no
# country metadata — it ranks #3 and is meaningful for the analysis.
top10 = df["country_primary"].value_counts().head(10).index.tolist()
print(f"\nTop 10 countries (Unknown included): {top10}")

# ── 4. Filter to top 10 ───────────────────────────────────────────────────────
df = df[df["country_primary"].isin(top10)]

# ── 5. Count Movies and TV Shows per country ─────────────────────────────────
counts = (
    df.groupby(["country_primary", "type"])
    .size()
    .reset_index(name="count")
    .rename(columns={"country_primary": "country"})
)

# ── 6. Sort by total (descending) ────────────────────────────────────────────
totals = counts.groupby("country")["count"].sum().reset_index(name="total")
country_order = totals.sort_values("total", ascending=False)["country"].tolist()
counts["country"] = pd.Categorical(counts["country"], categories=country_order, ordered=True)
counts = counts.sort_values(["country", "type"]).reset_index(drop=True)

print(f"\nFinal graph2_data.csv preview:")
print(counts.to_string(index=False))

# ── 7. Save ───────────────────────────────────────────────────────────────────
counts.to_csv(OUTPUT_PATH, index=False)
print(f"\nSaved → {OUTPUT_PATH}")
