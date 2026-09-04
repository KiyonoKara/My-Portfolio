import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withBase } from "@/lib/base";
import { normalizeWord } from "@/lib/sanitize";
import DemoSkeleton from "@/components/demos/DemoSkeleton";

type Pred = [string, number];
interface Payload {
  predictions: Record<string, Pred[]>;
  vocabSize: number;
  radicalCount: number;
}

const CANDIDATES = [
  "water", "fire", "tree", "love", "mountain", "heart",
  "sun", "moon", "time", "rain", "river", "gold",
];

export default function KanjiDemo() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  const [word, setWord] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(withBase("/demos/kanji/predictions.json"))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("fetch failed"))))
      .then((d: Payload) => {
        if (alive) {
          setPayload(d);
          setStatus("ready");
        }
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, []);

  const vocab = useMemo(() => (payload ? Object.keys(payload.predictions) : []), [payload]);
  const norm = normalizeWord(query);

  const examples = useMemo(() => {
    if (!payload) return [];
    const hits = CANDIDATES.filter((w) => payload.predictions[w]);
    return hits.length ? hits.slice(0, 6) : vocab.slice(0, 6);
  }, [payload, vocab]);

  const suggestions = useMemo(() => {
    if (!norm || !payload || payload.predictions[norm]) return [];
    return vocab.filter((w) => w.startsWith(norm)).slice(0, 6);
  }, [norm, vocab, payload]);

  const result = word && payload ? payload.predictions[word] ?? null : null;
  const notFound = word !== null && !result;

  const chartData = useMemo(
    () => (result ?? []).map(([rad, prob]) => ({ rad, prob, pct: Math.round(prob * 100) })),
    [result]
  );

  function submit(w: string) {
    const n = normalizeWord(w);
    setQuery(n);
    setWord(n === "" ? null : n);
  }

  if (status === "loading") {
    return <DemoSkeleton label="Loading model predictions…" />;
  }
  if (status === "error") {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Couldn't load the predictions file. Run <code className="font-mono">pnpm export:demos</code> to generate it.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(normalizeWord(e.target.value))}
            placeholder="Enter an English word…"
            aria-label="English word"
            autoComplete="off"
            spellCheck={false}
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 flex w-full flex-wrap gap-1.5 rounded-lg border border-border bg-popover p-2 shadow-md">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground hover:bg-cavern/15"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button type="submit">Predict radicals</Button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Try:</span>
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => submit(ex)}
            className="rounded-full border border-border px-2.5 py-0.5 font-mono transition-colors hover:border-cavern/40 hover:text-cavern"
          >
            {ex}
          </button>
        ))}
      </div>

      {notFound && (
        <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">"{word}"</span> isn't in the training
          vocabulary ({payload?.vocabSize.toLocaleString()} words). Try one of the suggestions above.
        </p>
      )}

      {result && (
        <motion.figure
          key={word}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-xl border border-border bg-background/60 p-4"
        >
          <figcaption className="mb-3 text-sm text-muted-foreground">
            Top radicals linked to{" "}
            <span className="font-semibold text-foreground">"{word}"</span>, with confidence from 0 to 1.
          </figcaption>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 4 }}>
                <XAxis
                  dataKey="rad"
                  tick={{ fontSize: 18, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  interval={0}
                />
                <YAxis
                  domain={[0, 1]}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${Math.round(v * 100)}%`, "confidence"]}
                  labelFormatter={(l) => `Radical ${l}`}
                />
                <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="var(--cavern)" fillOpacity={1 - i * 0.06} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.figure>
      )}
    </div>
  );
}
