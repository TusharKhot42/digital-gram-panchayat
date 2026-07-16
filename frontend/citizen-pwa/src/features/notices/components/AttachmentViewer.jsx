import { useTranslation } from 'react-i18next';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/SafeImage';

/**
 * Shows an image inline or a PDF link, with a download button. Uses the browser's native
 * download for the attachment URL (Cloudinary/mock).
 */
export function AttachmentViewer({ url, type }) {
  const { t } = useTranslation();
  if (!url) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      {type === 'image' ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <SafeImage src={url} className="max-h-64 min-h-24 w-full rounded-md object-contain" />
        </a>
      ) : (
        <div className="flex items-center gap-2 text-sm text-foreground">
          <FileText className="h-5 w-5 text-primary" />
          <span className="flex-1">{t('notice.detail.pdfAttachment')}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('notice.detail.open')}
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>
      )}

      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
        <a href={url} download target="_blank" rel="noopener noreferrer">
          <Download className="h-4 w-4" />
          {t('notice.detail.download')}
        </a>
      </Button>
    </div>
  );
}
