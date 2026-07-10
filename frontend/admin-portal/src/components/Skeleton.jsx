/** Content-shaped loading placeholders for admin screens. */
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} aria-hidden="true" />;
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
