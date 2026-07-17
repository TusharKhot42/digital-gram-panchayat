import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, File, ExternalLink, Download, Maximize2 } from 'lucide-react';
import { documentKind, thumbnailUrl } from '@dgp/shared';
import { cn } from '@/utils/cn';
import { SafeImage } from '@/components/SafeImage';
import { Lightbox } from '@/components/Lightbox';

/**
 * The one document viewer for the whole app. Given a stored file ({ url, type?, name? }) it
 * renders the right affordance for its kind and offers the same four actions everywhere —
 * so a complaint photo, a tax bill, a certificate document, a notice attachment and a scheme
 * form all behave identically.
 *
 *   image → thumbnail (lazy, Cloudinary-resized, broken-safe) → click for fullscreen + zoom
 *   pdf   → labelled tile → Preview (new tab) + Download
 *   file  → generic tile → Open + Download
 *
 * `variant="tile"` (default) is a fixed-size gallery cell; `variant="row"` is a full-width
 * list row. No other viewer should exist — replace ad-hoc <img>/<a> document markup with this.
 */
export function DocumentViewer({ doc, variant = 'tile', className }) {
  const { t } = useTranslation();
  const [fullscreen, setFullscreen] = useState(false);

  if (!doc?.url) return null;

  const kind = documentKind(doc);
  const label = doc.name || doc.url.split('/').pop();

  const actions = (
    <div className="flex items-center gap-1">
      {kind === 'image' ? (
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          aria-label={t('doc.fullscreen')}
          title={t('doc.fullscreen')}
          className="rounded-md p-2 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('doc.open')}
          title={t('doc.open')}
          className="rounded-md p-2 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
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

  if (variant === 'row') {
    return (
      <>
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-md border border-border bg-card p-2.5',
            className,
          )}
        >
          {kind === 'image' ? (
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="shrink-0 overflow-hidden rounded"
              aria-label={t('doc.fullscreen')}
            >
              <SafeImage
                src={thumbnailUrl(doc.url, 96)}
                alt={label}
                loading="lazy"
                className="h-10 w-10 object-cover"
              />
            </button>
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary-subtle text-primary">
              {kind === 'pdf' ? (
                <FileText className="h-5 w-5" aria-hidden="true" />
              ) : (
                <File className="h-5 w-5" aria-hidden="true" />
              )}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-body text-foreground">{label}</span>
          {actions}
        </div>
        {kind === 'image' ? (
          <Lightbox
            src={fullscreen ? doc.url : null}
            label={label}
            onClose={() => setFullscreen(false)}
          />
        ) : null}
      </>
    );
  }

  // Default: gallery tile.
  return (
    <>
      <div
        className={cn('w-40 overflow-hidden rounded-md border border-border bg-card', className)}
      >
        {kind === 'image' ? (
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            title={t('doc.fullscreen')}
            className="block w-full transition-opacity duration-150 hover:opacity-90"
          >
            <SafeImage
              src={thumbnailUrl(doc.url, 320)}
              alt={label}
              loading="lazy"
              className="h-24 w-full object-cover"
            />
          </button>
        ) : (
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-24 w-full items-center justify-center bg-primary-subtle transition-opacity duration-150 hover:opacity-90"
          >
            {kind === 'pdf' ? (
              <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
            ) : (
              <File className="h-8 w-8 text-primary" aria-hidden="true" />
            )}
          </a>
        )}
        <div className="flex items-center justify-between gap-1 border-t border-border px-2 py-1.5">
          <span className="min-w-0 flex-1 truncate text-caption text-foreground">{label}</span>
          {actions}
        </div>
      </div>
      {kind === 'image' ? (
        <Lightbox
          src={fullscreen ? doc.url : null}
          label={label}
          onClose={() => setFullscreen(false)}
        />
      ) : null}
    </>
  );
}
