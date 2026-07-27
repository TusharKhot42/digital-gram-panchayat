/**
 * The single "nothing here yet" pattern. An icon in a soft brand disc, a plain-language
 * headline, one line of guidance, and (optionally) the action that fixes it — so an empty
 * screen still tells the officer what to do next instead of just being blank.
 */
export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center ${className}`}
    >
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle">
          <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
      ) : null}
      <p className="text-section text-foreground">{title}</p>
      {description ? (
        <p className="max-w-xs text-body text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
