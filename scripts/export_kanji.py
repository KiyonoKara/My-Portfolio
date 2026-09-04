#!/usr/bin/env python3
"""
Precompute the Kanji-Radical-Match model's predictions into a static JSON so the
browser demo needs no Python and no model runtime.
The active model (utils.KanjiFFNN) is Linear(vocab->300) to Linear(300->radicals)
to sigmoid, with one-hot encoding. So the full word ti radical probability
matrix is a single vectorized forward pass. Will still take the top-10 radicals per word
Run from the repo root with venv/bin/python scripts/export_kanji.py
"""
import json
import os
import sys

import torch
import torch.nn as nn
from sklearn import preprocessing

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KANJI = os.path.join(REPO, "ml-project-assets", "kanji")
DATA = os.path.join(KANJI, "data", "english_to_radicals.json")
STATE = os.path.join(KANJI, "models", "model_v4_state_dict.pt")
OUT_DIR = os.path.join(REPO, "public", "demos", "kanji")
TOP_TAKE = 10


class KanjiFFNN(nn.Module):
    def __init__(self, eng_vocab_size: int, radical_vocab_size: int):
        super().__init__()
        self.input = nn.Linear(eng_vocab_size, 300)
        self.output = nn.Linear(300, radical_vocab_size)

    def forward(self, x):
        return torch.sigmoid(self.output(self.input(x)))


def main() -> int:
    if not os.path.exists(STATE):
        print(f"[kanji] missing model weights: {STATE}", file=sys.stderr)
        return 1

    with open(DATA, encoding="utf-8") as f:
        eng_to_rad = json.load(f)

    # Reproduce the exact vocab ordering the model was trained with.
    enc_eng = preprocessing.LabelBinarizer().fit(list(eng_to_rad.keys()))
    enc_rad = preprocessing.MultiLabelBinarizer().fit(list(eng_to_rad.values()))
    eng_vocab = list(enc_eng.classes_)
    rad_vocab = list(enc_rad.classes_)

    model = KanjiFFNN(len(eng_vocab), len(rad_vocab))
    model.load_state_dict(torch.load(STATE, map_location="cpu"))
    model.eval()

    with torch.no_grad():
        # hidden[i] = input.weight[:, i] + input.bias  (one-hot per word)
        hidden = model.input.weight.t() + model.input.bias  # [V, 300]
        logits = hidden @ model.output.weight.t() + model.output.bias  # [V, R]
        probs = torch.sigmoid(logits)  # [V, R]
        top_probs, top_idx = torch.topk(probs, k=min(TOP_TAKE, len(rad_vocab)), dim=1)

    predictions = {}
    for wi, word in enumerate(eng_vocab):
        idxs = top_idx[wi].tolist()
        vals = top_probs[wi].tolist()
        predictions[word] = [[rad_vocab[j], round(float(v), 3)] for j, v in zip(idxs, vals)]

    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, "predictions.json")
    payload = {
        "model": "KanjiFFNN v4 (feedforward, sigmoid)",
        "topK": TOP_TAKE,
        "vocabSize": len(eng_vocab),
        "radicalCount": len(rad_vocab),
        "predictions": predictions,
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))

    size_mb = os.path.getsize(out) / 1e6
    print(f"[kanji] wrote {out}  ({len(eng_vocab)} words, {size_mb:.2f} MB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
