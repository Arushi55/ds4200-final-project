"""
Graph 5 Data Cleaning Script (Treemap)
========================================
Input:  netflix_titles_clean.csv
Output: graph5_treemap_data.csv

Three-level hierarchy:
  Level 1 — Netflix catalog (root)
  Level 2 — Content type: Movie vs TV Show
  Level 3 — Top 10 genres within each content type

Steps:
  1. Explode listed_in so each row has one genre
  2. For each content type, count top 10 genres dynamically
  3. Save to graph5_treemap_data.csv
"""

import pandas as pd

INPUT_PATH  = "netflix_titles_clean.csv"
OUTPUT_PATH = "graph5_treemap_data.csv"

# -- 1. Load ------------------------------------------------------------------
df = pd.read_csv(INPUT_PATH)
print(f"Loaded {len(df):,} rows")

# -- 2. Explode genres --------------------------------------------------------
df["genre"] = df["listed_in"].str.split(", ")
exploded = df.explode("genre")
exploded["genre"] = exploded["genre"].str.strip()

# -- 3. Top 10 genres per content type ----------------------------------------
rows = []
for ctype in ["Movie", "TV Show"]:
    sub  = exploded[exploded["type"] == ctype]
    top10 = sub["genre"].value_counts().head(10)
    for genre, count in top10.items():
        rows.append({"type": ctype, "genre": genre, "value": int(count)})

out = pd.DataFrame(rows)
out.to_csv(OUTPUT_PATH, index=False)

print(f"Saved → {OUTPUT_PATH}  ({len(out)} rows)\n")
print(out.to_string(index=False))
