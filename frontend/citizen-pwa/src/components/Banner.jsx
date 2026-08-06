import { cn } from '@/utils/cn';

/**
 * A decorative banner band.
 *
 * The `aspect-[16/9]`-style ratio is set by the caller and the image fills it absolutely, so
 * the browser reserves the exact box before the file arrives. That is the whole reason this
 * component exists rather than a bare `<img>`: an unsized banner above the fold pushes the
 * page down when it loads, and on a slow village connection the citizen watches the thing
 * they were reading jump away from them.
 *
 * `children` render over the artwork, above a scrim that keeps text legible whatever the
 * picture does underneath.
 */
export function Banner({
  src,
  alt = '',
  className,
  ratio = 'aspect-[16/9]',
  eager = false,
  scrim = true,
  children,
}) {
  return (
    <div className={cn('relative isolate overflow-hidden', ratio, className)}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        // Above-the-fold banners opt out of lazy loading; everything else waits its turn.
        // No fetchpriority hint. React 18 only passes the lowercase spelling through and warns
        // on the camelCase one; eslint-plugin-react wants the camelCase one. Nothing rendered by
        // this component is the page's largest paint, so the hint is not worth the fight.
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
      {scrim ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0B1E45]/85 via-[#0B1E45]/35 to-transparent"
        />
      ) : null}
      {children ? <div className="relative h-full">{children}</div> : null}
    </div>
  );
}
