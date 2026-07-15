import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { formatDateTime, pickLocale } from '@dgp/shared';
import { AttachmentViewer } from '../components/AttachmentViewer';
import { useNotice } from '../hooks';

export function NoticeDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: n, isLoading, isError } = useNotice(id);

  if (isLoading)
    return <p className="px-4 py-6 text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !n)
    return <p className="px-4 py-6 text-sm text-destructive">{t('notice.detail.notFound')}</p>;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <Link
        to="/notices"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('notice.detail.back')}
      </Link>

      <h1 className="text-lg font-semibold text-foreground">
        {pickLocale(n.i18n, 'title', locale, n.title)}
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">
        {t(`notice.category.${n.category}`, n.category)} ·{' '}
        {formatDateTime(n.publishDate || n.createdAt, locale)}
      </p>

      {pickLocale(n.i18n, 'summary', locale, n.summary) ? (
        <p className="mt-3 rounded-md bg-muted p-3 text-sm text-foreground">
          {pickLocale(n.i18n, 'summary', locale, n.summary)}
        </p>
      ) : null}

      <p className="mt-4 whitespace-pre-wrap text-sm text-foreground">
        {pickLocale(n.i18n, 'content', locale, n.content)}
      </p>

      {n.attachmentUrl ? (
        <div className="mt-5">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            {t('notice.detail.attachment')}
          </h2>
          <AttachmentViewer url={n.attachmentUrl} type={n.attachmentType} />
        </div>
      ) : null}
    </div>
  );
}
