/**
 * Content-shaped loading placeholders. Communicate "loading" without layout shift, replacing
 * bare spinner text on list/detail screens.
 */
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} aria-hidden="true" />;
}

/** A vertical stack of card-shaped skeletons for list screens. */
export function SkeletonList({ count = 4 }) {
  return (
    <ul className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <li key={`sk-${i}`} className="rounded-lg border border-border bg-card p-4">
          <Skeleton className="mb-2 h-4 w-2/3" />
          <Skeleton className="mb-2 h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </li>
      ))}
    </ul>
  );
}
