/** Content-shaped loading placeholders for admin screens. */
export function Skeleton({ className = '' }) {
  // Soft base plus a sweeping highlight; the sweep is neutralised under prefers-reduced-motion.
  return (
    <div className={`relative overflow-hidden rounded-md bg-muted ${className}`} aria-hidden="true">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-card/60 to-transparent" />
    </div>
  );
}

/** Skeleton rows for a table/list while data loads. */
export function SkeletonRows({ count = 6 }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={`row-${i}`} className="h-12 w-full" />
      ))}
    </div>
  );
}
