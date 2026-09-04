import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { withBase } from "@/lib/base";
import { clampText } from "@/lib/sanitize";
import { stem } from "@/lib/porter";
import DemoSkeleton from "@/components/demos/DemoSkeleton";

interface Model {
  intercept: number;
  tokens: string[];
  coef: number[];
  stopWords: string[];
}

const MAX_LEN = 1000;
const EXAMPLES: { label: string; text: string }[] = [
  { label: "Calm", text: "Thanks for driving me today, you're the best." },
  { label: "Mildly annoyed", text: "Service was slow and the food was disappointing." },
  { label: "Heated", text: "You are stupid and useless." },
];

const TOKEN_RE = /[a-z0-9_]{2,}/g;

function bandFor(p: number): { label: string; className: string } {
  if (p < 0.2) return { label: "Calm", className: "text-bamboo" };
  if (p < 0.4) return { label: "Mostly civil", className: "text-bamboo" };
  if (p < 0.6) return { label: "Mixed", className: "text-rock" };
  if (p < 0.8) return { label: "Heated", className: "text-cavern" };
  return { label: "Inflammatory", className: "text-destructive" };
}

export default function SentimentDemo() {
  const [model, setModel] = useState<Model | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [text, setText] = useState(EXAMPLES[0].text);

  useEffect(() => {
    let alive = true;
    fetch(withBase("/demos/sentiment/lr_model.json"))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("fetch failed"))))
      .then((d: Model) => {
        if (alive) {
          setModel(d);
          setStatus("ready");
        }
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, []);

  const index = useMemo(() => {
    const m = new Map<string, number>();
    model?.tokens.forEach((t, i) => m.set(t, i));
    return m;
  }, [model]);
  const stops = useMemo(() => new Set(model?.stopWords ?? []), [model]);

  const analysis = useMemo(() => {
    if (!model) return null;
    const lower = text.toLowerCase();
    const counts = new Map<number, number>();
    let matched = 0;
    for (const m of lower.matchAll(TOKEN_RE)) {
      const raw = m[0];
      if (stops.has(raw)) continue;
      const s = stem(raw);
      const idx = index.get(s);
      if (idx === undefined) continue;
      matched += 1;
      counts.set(idx, (counts.get(idx) ?? 0) + 1);
    }
    let logit = model.intercept;
    const contribs: { token: string; value: number }[] = [];
    for (const [idx, c] of counts) {
      const v = c * model.coef[idx];
      logit += v;
      contribs.push({ token: model.tokens[idx], value: v });
    }
    const prob = 1 / (1 + Math.exp(-logit));
    contribs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    return { prob, matched, contribs: contribs.slice(0, 6) };
  }, [text, model, index, stops]);

  if (status === "loading") {
    return <DemoSkeleton label="Loading model weights…" />;
  }
  if (status === "error") {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Couldn't load the model. Run <code className="font-mono">pnpm export:demos</code> to generate it.
      </p>
    );
  }

  const pct = analysis ? Math.round(analysis.prob * 100) : 0;
  const band = bandFor(analysis?.prob ?? 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Load an example:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => setText(ex.text)}
            className="rounded-full border border-border px-2.5 py-0.5 transition-colors hover:border-cavern/40 hover:text-cavern"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div>
        <textarea
          value={text}
          onChange={(e) => setText(clampText(e.target.value, MAX_LEN))}
          rows={4}
          maxLength={MAX_LEN}
          spellCheck={false}
          aria-label="Text to score"
          className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/60"
          placeholder="Type or paste some text…"
        />
        <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>{analysis?.matched ?? 0} model tokens matched</span>
          <span>{text.length}/{MAX_LEN}</span>
        </div>
      </div>

      {/* Meter */}
      <div className="rounded-xl border border-border bg-background/60 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Inflammatory score</span>
          <span className={`inline-flex items-center gap-2 font-display text-2xl font-semibold ${band.className}`}>
            {(analysis?.prob ?? 0).toFixed(2)}
            <span className="inline-block size-1.5 rounded-full bg-current opacity-40" />
            {band.label}
          </span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-bamboo via-cavern to-destructive"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>calm</span>
          <span>inflammatory</span>
        </div>
      </div>

      {analysis && analysis.contribs.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Most influential tokens
          </p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.contribs.map((c) => (
              <span
                key={c.token}
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-xs ${
                  c.value >= 0
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-bamboo/30 bg-bamboo/10 text-bamboo"
                }`}
                title={`weight ${c.value.toFixed(3)}`}
              >
                {c.token}
                {c.value >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        This is the <strong className="text-foreground">Logistic Regression</strong> model running
        client-side (bag-of-words + Porter stemming, a close approximation of the original NLTK
        pipeline). The heavier FFNN and BERT models from the project are shown as results in the case
        study rather than live inference.
      </p>
    </div>
  );
}
