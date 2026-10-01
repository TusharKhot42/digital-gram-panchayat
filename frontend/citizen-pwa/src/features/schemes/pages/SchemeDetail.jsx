import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ExternalLink,
  Landmark,
  FileText,
  CheckCircle2,
  Gift,
  ListOrdered,
  Paperclip,
} from 'lucide-react';
import { DocumentViewer } from '@/components/DocumentViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { SafeImage } from '@/components/SafeImage';
import { pickLocale } from '@dgp/shared';
import { useScheme } from '../hooks';

/** One titled block of scheme copy. Renders nothing when the field is empty. */
function Section({ title, icon: Icon, children }) {
  if (!children) return null;
  return (
    <section className="mt-4">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-section text-foreground">{title}</h2>
      </div>
      <Card>
        <CardContent className="p-3.5">{children}</CardContent>
      </Card>
    </section>
  );
}

const proseClass = 'whitespace-pre-wrap text-body leading-relaxed text-body-foreground';

export function SchemeDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = (i18n.language || '').toLowerCase().startsWith('mr') ? 'mr' : 'en';
  const { data: s, isLoading, isError } = useScheme(id);

  if (isLoading)
    return <p className="dgp-page text-body text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !s)
    return (
      <p className="dgp-page text-body text-destructive-strong">{t('scheme.detail.notFound')}</p>
    );

  const title = pickLocale(s.i18n, 'title', locale, s.title);
  const summary = pickLocale(s.i18n, 'summary', locale, s.summary);
  const description = pickLocale(s.i18n, 'description', locale, s.description);
  const eligibility = pickLocale(s.i18n, 'eligibility', locale, s.eligibility);
  const benefits = pickLocale(s.i18n, 'benefits', locale, s.benefits);
  const applicationProcess = pickLocale(s.i18n, 'applicationProcess', locale, s.applicationProcess);

  return (
    <div className="dgp-page">
      <PageHeader backTo="/schemes" backLabel={t('scheme.detail.back')} title={title} />

      {/* Hero */}
      {s.imageUrl ? (
        <SafeImage
          src={s.imageUrl}
          className="mb-4 h-44 w-full rounded-lg border border-border object-cover"
        />
      ) : (
        <div className="mb-4 flex h-32 w-full items-center justify-center rounded-lg bg-primary-subtle">
          <Landmark className="h-10 w-10 text-primary/40" aria-hidden="true" />
        </div>
      )}

      <span className="inline-block rounded-full bg-secondary px-2.5 py-0.5 text-caption font-medium text-secondary-foreground ring-1 ring-inset ring-border">
        {t(`scheme.category.${s.category}`, s.category)}
      </span>

      {summary ? <p className="mt-3 text-body text-foreground">{summary}</p> : null}

      <Section title={t('scheme.detail.description')} icon={FileText}>
        {description ? <p className={proseClass}>{description}</p> : null}
      </Section>

      <Section title={t('scheme.detail.eligibility')} icon={CheckCircle2}>
        {eligibility ? <p className={proseClass}>{eligibility}</p> : null}
      </Section>

      <Section title={t('scheme.detail.requiredDocuments')} icon={FileText}>
        {s.requiredDocuments?.length ? (
          <ul className="space-y-1.5">
            {s.requiredDocuments.map((d, i) => (
              <li key={`${d}-${i}`} className="flex gap-2 text-body text-body-foreground">
                <span
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {d}
              </li>
            ))}
          </ul>
        ) : null}
      </Section>

      <Section title={t('scheme.detail.benefits')} icon={Gift}>
        {benefits ? <p className={proseClass}>{benefits}</p> : null}
      </Section>

      <Section title={t('scheme.detail.applicationProcess')} icon={ListOrdered}>
        {applicationProcess ? <p className={proseClass}>{applicationProcess}</p> : null}
      </Section>

      {/* Downloadable forms/circulars the officer attached to the scheme. */}
      <Section title={t('scheme.detail.attachments')} icon={Paperclip}>
        {s.attachments?.length ? (
          <ul className="space-y-2">
            {s.attachments.map((a) => (
              <li key={a.url}>
                <DocumentViewer variant="row" doc={a} />
              </li>
            ))}
          </ul>
        ) : null}
      </Section>

      {s.officialWebsite ? (
        <Button asChild className="mt-6 w-full">
          <a href={s.officialWebsite} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            {t('scheme.detail.officialSite')}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
