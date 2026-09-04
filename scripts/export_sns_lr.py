#!/usr/bin/env python3
"""
Export the SNS Sentiment Logistic-Regression model to JSON weights so the browser
can score text with a bag-of-words dot product + sigmoid with no Python at runtime.
FFNN and BERT  models are left out because they are too big
Run from the repo root with venv/bin/python scripts/export_sns_lr.py
"""
import ast
import json
import os
import pickle
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SNS = os.path.join(REPO, "ml-project-assets", "sentiment")
MODEL = os.path.join(SNS, "models", "sns_best_lr.pkl")
VOCAB = os.path.join(SNS, "datasets", "processed", "vocabulary.txt")
OUT_DIR = os.path.join(REPO, "public", "demos", "sentiment")


def main() -> int:
    if not os.path.exists(MODEL):
        print(f"[sns] missing model: {MODEL}", file=sys.stderr)
        return 1

    with open(MODEL, "rb") as f:
        clf = pickle.load(f)

    with open(VOCAB, encoding="utf-8") as f:
        vocabulary = ast.literal_eval(f.read())
    vocabulary = [str(t) for t in vocabulary]

    coef = clf.coef_[0].tolist()  # binary LR -> shape (1, n_features)
    intercept = float(clf.intercept_[0])
    classes = [int(c) for c in getattr(clf, "classes_", [0, 1])]

    if len(coef) != len(vocabulary):
        print(
            f"[sns] WARNING: coef length {len(coef)} != vocab length {len(vocabulary)}. "
            "Feature alignment may be off.",
            file=sys.stderr,
        )

    # Ship sklearn's English stop-word list so the JS tokenizer matches training.
    try:
        from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
        stop_words = sorted(ENGLISH_STOP_WORDS)
    except Exception:
        stop_words = []

    # Round coefficients to trim payload size.
    coef = [round(c, 5) for c in coef]

    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, "lr_model.json")
    payload = {
        "model": "LogisticRegression (bag-of-words)",
        "note": "positiveClass is the inflammatory/offensive label",
        "positiveClass": classes[-1] if classes else 1,
        "intercept": intercept,
        "tokens": vocabulary,
        "coef": coef,
        "stopWords": stop_words,
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))

    size_kb = os.path.getsize(out) / 1e3
    print(f"[sns] wrote {out}  ({len(vocabulary)} tokens, {size_kb:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
