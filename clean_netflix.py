"""
Netflix Titles Dataset Cleaning Script
=======================================
Missing value rules:
  - director   : drop rows where missing
  - cast        : drop rows where missing
  - country     : fill with "Unknown"
  - date_added  : drop rows where missing
  - rating      : fill with "Unknown"
  - duration    : fix misplaced values, then split into
                  duration_value (int) and duration_unit (str)
"""

import pandas as pd

INPUT_PATH  = "netflix_titles.csv"
OUTPUT_PATH = "netflix_titles_clean.csv"

df = pd.read_csv(INPUT_PATH)
print(f"Original shape: {df.shape[0]:,} rows × {df.shape[1]} columns")
print("\nMissing values before cleaning:")
print(df.isnull().sum()[df.isnull().sum() > 0].to_string())

# ── 1. Fix misplaced duration values in `rating` ─────────────────────────────
# Some rows have e.g. "74 min" in `rating` instead of a real rating.
bad_rating_mask = df["rating"].str.match(r"^\d+\s*min$", na=False)
print(f"\n  → {bad_rating_mask.sum()} rows with duration value misplaced in `rating` — corrected")
df.loc[bad_rating_mask & df["duration"].isna(), "duration"] = df.loc[bad_rating_mask, "rating"]
df.loc[bad_rating_mask, "rating"] = pd.NA

# ── 2. Drop rows with missing director, cast, or date_added ──────────────────
for col in ["director", "cast", "date_added"]:
    before = len(df)
    df = df.dropna(subset=[col])
    dropped = before - len(df)
    print(f"  → Dropped {dropped:,} rows with missing `{col}`")

# ── 3. Fill missing country and rating ───────────────────────────────────────
for col, fill in [("country", "Unknown"), ("rating", "Unknown")]:
    n = df[col].isna().sum()
    df[col] = df[col].fillna(fill)
    print(f"  → Filled {n} missing `{col}` values with 'Unknown'")

# ── 4. Split duration into value + unit ──────────────────────────────────────
# "90 min"   → duration_value=90,  duration_unit="min"
# "2 Seasons"→ duration_value=2,   duration_unit="Seasons"
duration_parts = df["duration"].str.extract(r"^(\d+)\s+(.+)$")
df["duration_value"] = pd.to_numeric(duration_parts[0], errors="coerce").astype("Int64")
df["duration_unit"]  = duration_parts[1]
df = df.drop(columns=["duration"])

n_unparsed = df["duration_value"].isna().sum()
if n_unparsed:
    print(f"  → {n_unparsed} `duration` values could not be parsed (set to NA)")

# ── 5. Parse date_added as proper datetime ────────────────────────────────────
df["date_added"] = pd.to_datetime(df["date_added"], format="%B %d, %Y", errors="coerce")

# ── 6. Summary ────────────────────────────────────────────────────────────────
print(f"\nFinal shape: {df.shape[0]:,} rows × {df.shape[1]} columns")
remaining = df.isnull().sum()
remaining = remaining[remaining > 0]
if remaining.empty:
    print("No remaining nulls.")
else:
    print("Remaining nulls:")
    print(remaining.to_string())

print("\nColumn overview:")
print(df.dtypes.to_string())

# ── 7. Save ───────────────────────────────────────────────────────────────────
df.to_csv(OUTPUT_PATH, index=False)
print(f"\nSaved → {OUTPUT_PATH}")
