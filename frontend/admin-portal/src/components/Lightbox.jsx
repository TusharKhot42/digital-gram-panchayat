import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Full-screen image viewer.
 *
 * Four screens each had their own version of this overlay; two of them wrapped the whole
 * backdrop in a <button>, which announces the image as a giant unlabelled control. This one
 * is a real dialog with an explicit close button, Escape to dismiss, and a scrim built from
 * the foreground token so it isn't pure black in dark mode.
 *
 * Renders nothing when `src` is null, so callers can pass state straight through.
 */
export function Lightbox({ src, alt = '', label, onClose }) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!src) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [src, onClose]);

  if (!src) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label ?? t('common.close')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t('common.close')}
        autoFocus
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground shadow-md transition-colors duration-150 hover:bg-accent"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
      <img src={src} alt={alt} className="max-h-full max-w-full rounded-lg object-contain" />
    </div>,
    document.body,
  );
}
