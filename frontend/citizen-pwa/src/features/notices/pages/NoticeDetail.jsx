import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Radio } from 'lucide-react';
import { formatDateTime, pickLocale } from '@dgp/shared';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader, SectionHeader } from '@/components/PageHeader';
import { AttachmentViewer } from '../components/AttachmentViewer';
import { useNotice } from '../hooks';

export function NoticeDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: n, isLoading, isError } = useNotice(id);

  if (isLoading)
    return <p className="dgp-page text-body text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !n)
    return (
      <p className="dgp-page text-body text-destructive-strong">{t('notice.detail.notFound')}</p>
    );

  const summary = pickLocale(n.i18n, 'summary', locale, n.summary);
  const broadcast = Boolean(n.broadcast?.dispatchedAt);

  return (
    <div className="dgp-page">
      <PageHeader
        backTo="/notices"
        backLabel={t('notice.detail.back')}
        title={pickLocale(n.i18n, 'title', locale, n.title)}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-caption font-medium text-secondary-foreground ring-1 ring-inset ring-border">
          {t(`notice.category.${n.category}`, n.category)}
        </span>
        {broadcast ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2.5 py-0.5 text-caption font-medium text-primary ring-1 ring-inset ring-primary/20">
            <Radio className="h-3 w-3" aria-hidden="true" />
            {t('notice.broadcast')}
          </span>
        ) : null}
        <span className="text-caption text-muted-foreground">
          {formatDateTime(n.publishDate || n.createdAt, locale)}
        </span>
      </div>

      {/* The summary is the "read this if nothing else" line — given its own weight. */}
      {summary ? (
        <div className="mb-4 rounded-md border-l-4 border-primary bg-primary-subtle/50 p-3">
          <p className="text-body font-medium text-foreground">{summary}</p>
        </div>
      ) : null}

      <Card className="mb-6">
        <CardContent>
          <p className="whitespace-pre-wrap text-body leading-relaxed text-body-foreground">
            {pickLocale(n.i18n, 'content', locale, n.content)}
          </p>
        </CardContent>
      </Card>

      {n.attachmentUrl ? (
        <>
          <SectionHeader title={t('notice.detail.attachment')} />
          <Card className="overflow-hidden">
            <AttachmentViewer url={n.attachmentUrl} type={n.attachmentType} />
          </Card>
        </>
      ) : null}
    </div>
  );
}
