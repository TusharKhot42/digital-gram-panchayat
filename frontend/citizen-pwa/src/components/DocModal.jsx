import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { documentKind } from '@dgp/shared';

/**
 * In-portal document viewer. Opens any stored file ({ url, type?, name? }) inside the app —
 * images render inline, PDFs render in an embedded frame (the browser's built-in viewer, no
 * external application), and anything else still previews in the frame with a download
 * fallback. This is what lets a citizen read a tax bill or certificate document without the
 * file opening in a separate tab or app.
 *
 * Renders nothing when `doc` is null, so callers can pass state straight through.
 */
export function DocModal({ doc, onClose }) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!doc) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [doc, onClose]);

  if (!doc?.url) return null;

  const kind = documentKind(doc);
  const label = doc.name || doc.url.split('/').pop();

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-50 flex flex-col bg-foreground/85 p-3 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-overlay">
        <div className="flex items-center gap-1 border-b border-border px-4 py-2.5">
          <span className="min-w-0 flex-1 truncate text-body font-medium text-foreground">
            {label}
          </span>
          <a
            href={doc.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('doc.download')}
            title={t('doc.download')}
            className="rounded-md p-2 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label={t('common.close')}
            title={t('common.close')}
            className="rounded-md p-2 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {kind === 'image' ? (
          <div className="flex flex-1 items-center justify-center overflow-auto bg-muted p-3">
            <img src={doc.url} alt={label} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <iframe src={doc.url} title={label} className="flex-1 bg-muted" />
        )}
      </div>
    </div>,
    document.body,
  );
}
