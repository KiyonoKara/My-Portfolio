#!/usr/bin/env python3
"""
Bundle the Tabelog restaurants that have review data into a single static JSON.
The browser demo reimplements the item-item collaborative-filtering imputation
(mean-center -> cosine similarity over the 6 rating categories with top-k)
in TypeScript over the current snapshot. There's no scraping nor server
Run from the repo root with venv/bin/python scripts/export_tabelog.py
"""
import csv
import json
import os
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TABELOG = os.path.join(REPO, "ml-project-assets", "tabelog")
DATA = os.path.join(TABELOG, "data")
HISTORY = os.path.join(DATA, "tabelog_review_data_history.csv")
OUT_DIR = os.path.join(REPO, "public", "demos", "tabelog")

DIMS = ["overall_rating", "food", "service", "atmosphere", "price", "drink"]


def parse_num(x):
    x = (x or "").strip()
    if x == "":
        return None
    try:
        return round(float(x), 3)
    except ValueError:
        return None


def read_reviews(path):
    rows = []
    with open(path, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            rows.append([parse_num(r.get(d, "")) for d in DIMS])
    return rows


def resolve(path_field):
    # history paths look like "./data/tabelog_review_data/<file>.csv"
    rel = path_field.lstrip("./")
    if rel.startswith("data/"):
        return os.path.join(TABELOG, rel)
    return os.path.join(DATA, os.path.basename(path_field))


def main() -> int:
    if not os.path.exists(HISTORY):
        print(f"[tabelog] missing history index: {HISTORY}", file=sys.stderr)
        return 1

    restaurants = []
    with open(HISTORY, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            path = resolve(row["path"])
            if not os.path.exists(path):
                print(f"[tabelog] skip (missing): {path}", file=sys.stderr)
                continue
            reviews = read_reviews(path)
            if not reviews:
                continue
            restaurants.append(
                {
                    "name": row["store_name"].strip(),
                    "url": row["url"].strip(),
                    "reviews": reviews,
                }
            )

    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, "tabelog.json")
    payload = {
        "dims": DIMS,
        "dimLabels": ["Overall", "Food", "Service", "Atmosphere", "Cost", "Drink"],
        "restaurants": restaurants,
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))

    size_kb = os.path.getsize(out) / 1e3
    print(f"[tabelog] wrote {out}  ({len(restaurants)} restaurants, {size_kb:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
