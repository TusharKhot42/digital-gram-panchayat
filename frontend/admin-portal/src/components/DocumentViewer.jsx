import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, File, Eye, Download, Maximize2 } from 'lucide-react';
import { documentKind, thumbnailUrl } from '@dgp/shared';
import { cn } from '@/utils/cn';
import { SafeImage } from '@/components/SafeImage';
import { DocModal } from '@/components/DocModal';

/**
 * The one document viewer for the whole app. Given a stored file ({ url, type?, name? }) it
 * renders the right affordance for its kind and offers the same actions everywhere — so a
 * complaint photo, a tax bill, a certificate document, a notice attachment and a scheme form
 * all behave identically.
 *
 *   image → thumbnail (lazy, Cloudinary-resized, broken-safe) → click opens in-app viewer
 *   pdf   → labelled tile → View (in-app frame) + Download
 *   file  → generic tile → View + Download
 *
 * Everything opens inside the portal via {@link DocModal} — never a separate browser tab or an
 * external application. `variant="tile"` (default) is a fixed-size gallery cell; `variant="row"`
 * is a full-width list row. No other viewer should exist — replace ad-hoc <img>/<a> document
 * markup with this.
 */
export function DocumentViewer({ doc, variant = 'tile', className }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (!doc?.url) return null;

  const kind = documentKind(doc);
  const label = doc.name || doc.url.split('/').pop();
  const ViewIcon = kind === 'image' ? Maximize2 : Eye;

  const actions = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('doc.view')}
        title={t('doc.view')}
        className="rounded-md p-2 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
      >
        <ViewIcon className="h-4 w-4" aria-hidden="true" />
      </button>
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
    </div>
  );

  const thumb =
    kind === 'image' ? (
      <SafeImage
        src={thumbnailUrl(doc.url, variant === 'row' ? 96 : 320)}
        alt={label}
        loading="lazy"
        className={variant === 'row' ? 'h-10 w-10 object-cover' : 'h-24 w-full object-cover'}
      />
    ) : (
      <span
        className={cn(
          'flex items-center justify-center bg-primary-subtle text-primary',
          variant === 'row' ? 'h-10 w-10 rounded' : 'h-24 w-full',
        )}
      >
        {kind === 'pdf' ? (
          <FileText className={variant === 'row' ? 'h-5 w-5' : 'h-8 w-8'} aria-hidden="true" />
        ) : (
          <File className={variant === 'row' ? 'h-5 w-5' : 'h-8 w-8'} aria-hidden="true" />
        )}
      </span>
    );

  const modal = <DocModal doc={open ? doc : null} onClose={() => setOpen(false)} />;

  if (variant === 'row') {
    return (
      <>
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-md border border-border bg-card p-2.5',
            className,
          )}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 overflow-hidden rounded"
            aria-label={t('doc.view')}
          >
            {thumb}
          </button>
          <span className="min-w-0 flex-1 truncate text-body text-foreground">{label}</span>
          {actions}
        </div>
        {modal}
      </>
    );
  }

  // Default: gallery tile.
  return (
    <>
      <div
        className={cn('w-40 overflow-hidden rounded-md border border-border bg-card', className)}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          title={t('doc.view')}
          className="block w-full transition-opacity duration-150 hover:opacity-90"
        >
          {thumb}
        </button>
        <div className="flex items-center justify-between gap-1 border-t border-border px-2 py-1.5">
          <span className="min-w-0 flex-1 truncate text-caption text-foreground">{label}</span>
          {actions}
        </div>
      </div>
      {modal}
    </>
  );
}
