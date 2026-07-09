import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScheme } from '../hooks';

function Section({ title, children }) {
  if (!children) return null;
  return (
    <div className="mt-4">
      <h2 className="mb-1 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

export function SchemeDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { data: s, isLoading, isError } = useScheme(id);

  if (isLoading)
    return <p className="px-4 py-6 text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !s)
    return <p className="px-4 py-6 text-sm text-destructive">{t('scheme.detail.notFound')}</p>;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <Link
        to="/schemes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('scheme.detail.back')}
      </Link>

      {s.imageUrl ? (
        <img src={s.imageUrl} alt="" className="mb-4 h-40 w-full rounded-md object-cover" />
      ) : null}

      <h1 className="text-lg font-semibold text-foreground">{s.title}</h1>
      <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
        {t(`scheme.category.${s.category}`, s.category)}
      </span>

      {s.summary ? <p className="mt-3 text-sm text-foreground">{s.summary}</p> : null}

      <Section title={t('scheme.detail.description')}>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{s.description}</p>
      </Section>

      <Section title={t('scheme.detail.eligibility')}>
        {s.eligibility ? (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{s.eligibility}</p>
        ) : null}
      </Section>

      <Section title={t('scheme.detail.requiredDocuments')}>
        {s.requiredDocuments?.length ? (
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            {s.requiredDocuments.map((d, i) => (
              <li key={`${d}-${i}`}>{d}</li>
            ))}
          </ul>
        ) : null}
      </Section>

      <Section title={t('scheme.detail.benefits')}>
        {s.benefits ? (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{s.benefits}</p>
        ) : null}
      </Section>

      <Section title={t('scheme.detail.applicationProcess')}>
        {s.applicationProcess ? (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {s.applicationProcess}
          </p>
        ) : null}
      </Section>

      {s.officialWebsite ? (
        <Button asChild className="mt-6 w-full">
          <a href={s.officialWebsite} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            {t('scheme.detail.officialSite')}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
