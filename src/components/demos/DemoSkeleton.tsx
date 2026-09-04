/**
 * shared loading skeleton for the three playground demos, so they read as one
 * system while their client bundles and data files load.
 * animate-pulse is a CSS animation, so it flattens to a static block under prefers-reduced-motion
 * label is announced via role="status"
 */
export default function DemoSkeleton({ label = "Loading demo…" }: { label?: string }) {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-10 flex-1 rounded-md bg-muted animate-pulse" />
        <div className="h-10 w-full rounded-md bg-muted animate-pulse sm:w-40" />
      </div>
      <div className="flex flex-wrap gap-2">
        {["w-14", "w-20", "w-11", "w-12"].map((w, i) => (
          <div key={i} className={`h-5 rounded-full bg-muted animate-pulse ${w}`} />
        ))}
      </div>
      <div className="h-64 w-full rounded-xl border border-border bg-muted/40 animate-pulse" />
      <span className="sr-only" role="status">{label}</span>
    </div>
  );
}
