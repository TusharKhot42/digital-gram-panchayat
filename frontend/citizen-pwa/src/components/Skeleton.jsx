/**
 * Content-shaped loading placeholders. Communicate "loading" without layout shift, replacing
 * bare spinner text on list/detail screens.
 */
export function Skeleton({ className = '' }) {
  // A soft base plus a sweeping highlight — reads as "loading" without the harsher pulse.
  // prefers-reduced-motion neutralises the sweep via the global animation reset.
  return (
    <div className={`relative overflow-hidden rounded-md bg-muted ${className}`} aria-hidden="true">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-card/60 to-transparent" />
    </div>
  );
}

/** A vertical stack of card-shaped skeletons for list screens. */
export function SkeletonList({ count = 4 }) {
  return (
    <ul className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <li key={`sk-${i}`} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <Skeleton className="mb-2 h-4 w-2/3" />
          <Skeleton className="mb-2 h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </li>
      ))}
    </ul>
  );
}
