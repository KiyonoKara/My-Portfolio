import { useEffect, useMemo, useState } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip,
} from "recharts";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { withBase } from "@/lib/base";
import DemoSkeleton from "@/components/demos/DemoSkeleton";

type Row = (number | null)[];
interface Payload {
  dims: string[];
  dimLabels: string[];
  restaurants: { name: string; url: string; reviews: Row[] }[];
}

/**
 * item-item collaborative filtering over the six rating categories reimplemented from the project's NumPy engine.
 * uses mean-center each category, cosine similarity on shared support, min-max scale per column, then imputes each
 * missing cell using k-closest items and its average of the user's other ratings
 */
function computeCF(reviews: Row[], n: number) {
  const rows = reviews.length;
  const colMean = new Array(n).fill(0);
  const colCount = new Array(n).fill(0);
  for (const r of reviews) {
    for (let d = 0; d < n; d++) {
      const v = r[d];
      if (v != null) {
        colMean[d] += v;
        colCount[d] += 1;
      }
    }
  }
  for (let d = 0; d < n; d++) colMean[d] = colCount[d] ? colMean[d] / colCount[d] : 3;

  const sim = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        sim[i][j] = 1;
        continue;
      }
      let dot = 0, ni = 0, nj = 0;
      for (const r of reviews) {
        const a = r[i], b = r[j];
        if (a != null && b != null) {
          const ca = a - colMean[i], cb = b - colMean[j];
          dot += ca * cb;
          ni += ca * ca;
          nj += cb * cb;
        }
      }
      sim[i][j] = ni > 0 && nj > 0 ? dot / Math.sqrt(ni * nj) : 0;
    }
  }

  const scaled = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let j = 0; j < n; j++) {
    let mn = Infinity, mx = -Infinity;
    for (let i = 0; i < n; i++) {
      mn = Math.min(mn, sim[i][j]);
      mx = Math.max(mx, sim[i][j]);
    }
    const range = mx - mn;
    for (let i = 0; i < n; i++) scaled[i][j] = range > 1e-9 ? (sim[i][j] - mn) / range : 1;
  }

  const completed = reviews.map((r) => r.slice());
  let imputed = 0;
  for (let u = 0; u < rows; u++) {
    for (let j = 0; j < n; j++) {
      if (reviews[u][j] != null) continue;
      let num = 0, den = 0;
      for (let d = 0; d < n; d++) {
        if (d === j) continue;
        const v = reviews[u][d];
        if (v != null) {
          const w = scaled[j][d];
          num += w * v;
          den += w;
        }
      }
      let pred = den > 1e-9 ? num / den : colMean[j];
      pred = Math.max(1, Math.min(5, pred));
      completed[u][j] = Math.round(pred * 10) / 10;
      imputed += 1;
    }
  }

  const observedMean = colMean.map((m, d) => (colCount[d] ? Math.round(m * 100) / 100 : null));
  const completedMean = new Array(n).fill(0);
  for (let d = 0; d < n; d++) {
    let s = 0;
    for (let u = 0; u < rows; u++) s += completed[u][d] as number;
    completedMean[d] = rows ? Math.round((s / rows) * 100) / 100 : 0;
  }
  return { observedMean, completedMean, imputed, rows };
}

export default function TabelogDemo() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch(withBase("/demos/tabelog/tabelog.json"))
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

  const restaurant = payload?.restaurants[selected] ?? null;
  const n = payload?.dims.length ?? 6;

  const cf = useMemo(
    () => (restaurant ? computeCF(restaurant.reviews, n) : null),
    [restaurant, n]
  );

  const chartData = useMemo(() => {
    if (!payload || !cf) return [];
    return payload.dimLabels.map((label, d) => ({
      dim: label,
      observed: cf.observedMean[d] ?? 0,
      completed: cf.completedMean[d],
    }));
  }, [payload, cf]);

  if (status === "loading") {
    return <DemoSkeleton label="Loading restaurant data…" />;
  }
  if (status === "error" || !payload) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Couldn't load the dataset. Run <code className="font-mono">pnpm export:demos</code> to generate it.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-1 flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Restaurant</span>
          <select
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/60"
          >
            {payload.restaurants.map((r, i) => (
              <option key={r.name} value={i}>{r.name}</option>
            ))}
          </select>
        </label>
        {restaurant?.url && (
          <a
            href={restaurant.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 self-start font-mono text-xs text-muted-foreground transition-colors hover:text-cavern sm:self-end sm:pb-2"
          >
            view on Tabelog
            <ArrowUpRight className="size-3.5" />
          </a>
        )}
      </div>

      {cf && (
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid gap-6 md:grid-cols-[1.4fr_1fr]"
        >
          <figure className="rounded-xl border border-border bg-background/60 p-4">
            <figcaption className="mb-2 text-sm text-muted-foreground">
              Mean rating by category, observed versus filled in (1 to 5).
            </figcaption>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} outerRadius="72%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <PolarRadiusAxis domain={[1, 5]} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} angle={30} />
                  <Radar name="Observed" dataKey="observed" stroke="var(--bamboo)" fill="var(--bamboo)" fillOpacity={0.25} />
                  <Radar name="Completed" dataKey="completed" stroke="var(--cavern)" fill="var(--cavern)" fillOpacity={0.25} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </figure>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Reviews" value={cf.rows.toString()} />
              <Stat label="Cells imputed" value={cf.imputed.toString()} />
            </div>
            <ul className="flex flex-col gap-1.5 rounded-xl border border-border bg-background/60 p-4 text-sm">
              {payload.dimLabels.map((label, d) => (
                <li key={label} className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="inline-flex items-center gap-1 font-mono">
                    <span className="text-bamboo">{cf.observedMean[d]?.toFixed(2) ?? "n/a"}</span>
                    <ArrowRight className="size-3 text-muted-foreground" />
                    <span className="font-semibold text-cavern">{cf.completedMean[d].toFixed(2)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Cosine-similarity imputation tends to over-inflate sparse ratings. The project called
              this out, and it is why the Beta regression approach was the stronger half.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-cavern">{value}</p>
    </div>
  );
}
