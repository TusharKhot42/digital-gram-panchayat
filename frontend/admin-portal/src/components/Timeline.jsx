import { cn } from '@/utils/cn';

/**
 * Vertical dot-and-rail history. The same markup had been hand-rolled in the complaint
 * timeline, the certificate timeline, and the admin review panel, each with its own dot
 * size and inactive colour; this is the one implementation.
 *
 * `items` is oldest-first — the newest entry gets the emphasised dot, since that's the
 * state the record is actually in.
 */
export function Timeline({ items = [], className }) {
  if (!items.length) return null;

  return (
    <ol className={cn('space-y-4', className)}>
      {items.map((item, idx) => {
        const last = idx === items.length - 1;
        return (
          <li key={item.key ?? idx} className="flex gap-3">
            <div className="flex flex-col items-center" aria-hidden="true">
              <span
                className={cn(
                  'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
                  last ? 'bg-primary ring-4 ring-primary-subtle' : 'bg-border',
                )}
              />
              {!last ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
            </div>
            <div className="min-w-0 pb-1">
              <p className="text-body font-medium text-foreground">{item.title}</p>
              {item.meta ? <p className="text-caption text-muted-foreground">{item.meta}</p> : null}
              {item.note ? (
                <p className="mt-0.5 text-caption text-muted-foreground">{item.note}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
