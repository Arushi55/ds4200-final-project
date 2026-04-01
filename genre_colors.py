"""
genre_colors.py
-----------------
Shared genre-to-color mapping used by graph 1 (matplotlib) and graph 5 (Altair).
Import this in both notebooks to keep colors consistent across charts.

Usage:
    from genre_colors import GENRE_COLORS

    # matplotlib
    color = GENRE_COLORS.get(genre, "#888888")

    # Altair
    alt.Scale(domain=list(GENRE_COLORS.keys()), range=list(GENRE_COLORS.values()))
"""

GENRE_COLORS = {
    "International Movies":    "#78b98f",
    "Dramas":                  "#8a1341",
    "Comedies":                "#6fef70",
    "Action & Adventure":      "#eb67f9",
    "Independent Movies":      "#1c5f1e",
    "Romantic Movies":         "#f53a4c",
    "Children & Family Movies":"#a3c541",
    "Thrillers":               "#3a427d",
}
