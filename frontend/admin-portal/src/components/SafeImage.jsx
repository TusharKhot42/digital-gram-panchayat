import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * <img> that can never show the browser's broken-image glyph. If the URL 404s (old
 * records reference upload hosts that no longer exist), the image swaps for a quiet
 * styled placeholder of the same footprint, so galleries and cards keep their shape.
 */
export function SafeImage({ src, alt = '', className, ...props }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        role="img"
        aria-label={alt || 'unavailable'}
        className={cn(
          'flex items-center justify-center bg-secondary text-muted-foreground',
          className,
        )}
      >
        <ImageOff className="h-5 w-5" aria-hidden="true" />
      </span>
    );
  }

  return (
    <img src={src} alt={alt} className={className} onError={() => setFailed(true)} {...props} />
  );
}
