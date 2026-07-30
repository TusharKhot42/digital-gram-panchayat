import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Printer,
  Share2,
  ImageIcon,
  ListChecks,
} from 'lucide-react';
import { searchTopics, categoriesFor, countFaqs, getTopic, localizedText } from '@dgp/shared';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { controlClass } from '@/components/ui/input';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/utils/cn';

/**
 * Officer Help Center. Same authored knowledge base as the citizen side, filtered to the
 * officer audience — so an officer sees the administrative guides plus the shared topics
 * (language, theme, certificate verification) without duplicated content.
 */
export function Help() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'mr' ? 'mr' : 'en';
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');

  const openId = params.get('topic');
  const openTopic = openId ? getTopic(openId) : null;

  useEffect(() => {
    document.title = t('help.title');
  }, [t]);

  const categories = useMemo(() => categoriesFor('officer'), []);
  const results = useMemo(() => searchTopics(q, { audience: 'officer', category }), [q, category]);

  const L = (v) => localizedText(v, lang);

  if (openTopic) {
    return (
      <TopicDetail
        topic={openTopic}
        lang={lang}
        t={t}
        onBack={() => setParams({}, { replace: false })}
        onOpen={(id) => setParams({ topic: id })}
      />
    );
  }

  return (
    <div className="max-w-6xl">
      <header className="mb-5">
        <h1 className="text-title text-foreground">{t('help.title')}</h1>
        <p className="mt-1 text-body text-muted-foreground">{t('help.intro')}</p>
        <p className="mt-1 text-caption text-muted-foreground">
          {t('help.count', { topics: results.length, faqs: countFaqs(results) })}
        </p>
      </header>

      <div className="mb-4 space-y-3">
        <div className="relative sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="help-search" className="sr-only">
            {t('help.search')}
          </label>
          <input
            id="help-search"
            className={cn(controlClass, 'pl-9')}
            placeholder={t('help.searchPlaceholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <CategoryChip active={category === 'all'} onClick={() => setCategory('all')}>
            {t('help.allCategories')}
          </CategoryChip>
          {categories.map((c) => (
            <CategoryChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {t(`help.category.${c}`, c)}
            </CategoryChip>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t('help.noResults')}
          description={t('help.noResultsHint')}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((topic) => (
            <li key={topic.id}>
              <button
                type="button"
                onClick={() => setParams({ topic: topic.id })}
                className="h-full w-full text-left"
              >
                <Card interactive className="flex h-full flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-body font-semibold text-foreground">
                      {L(topic.title)}
                    </span>
                    {topic.minutes ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-caption text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {topic.minutes}m
                      </span>
                    ) : null}
                  </div>
                  <span className="text-caption text-muted-foreground">{L(topic.summary)}</span>
                  <span className="mt-auto pt-1">
                    <Chip color="blue">{t(`help.category.${topic.category}`, topic.category)}</Chip>
                  </span>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-9 rounded-full border px-3 text-caption font-medium transition-colors duration-150',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:bg-accent',
      )}
    >
      {children}
    </button>
  );
}

function TopicDetail({ topic, lang, t, onBack, onOpen }) {
  const L = (v) => localizedText(v, lang);

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?topic=${topic.id}`;
    try {
      if (navigator.share) await navigator.share({ title: L(topic.title), url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* dismissed */
    }
  };

  return (
    <article className="max-w-4xl help-print">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1.5 text-caption font-medium text-primary hover:text-primary-hover print:hidden"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        {t('help.backToList')}
      </button>

      <header className="mb-4">
        <h1 className="text-title text-foreground">{L(topic.title)}</h1>
        <p className="mt-1 text-body text-muted-foreground">{L(topic.summary)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Chip color="blue">{t(`help.category.${topic.category}`, topic.category)}</Chip>
          {topic.minutes ? (
            <span className="inline-flex items-center gap-1 text-caption text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {t('help.minutes', { count: topic.minutes })}
            </span>
          ) : null}
        </div>
      </header>

      <div className="mb-5 flex flex-wrap gap-2 print:hidden">
        {topic.route ? (
          <Link
            to={topic.route}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-body font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
          >
            {t('help.takeMeThere')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-4 text-body font-medium text-foreground transition-colors duration-150 hover:bg-accent"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          {t('help.print')}
        </button>
        <button
          type="button"
          onClick={share}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-4 text-body font-medium text-foreground transition-colors duration-150 hover:bg-accent"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          {t('help.share')}
        </button>
      </div>

      <div className="space-y-6">
        {topic.requirements?.length ? (
          <Section icon={ListChecks} title={t('help.requirements')}>
            <ul className="space-y-1.5">
              {topic.requirements.map((r, i) => (
                <li key={i} className="flex gap-2 text-body text-foreground">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-success-strong"
                    aria-hidden="true"
                  />
                  {L(r)}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        <Section icon={ListChecks} title={t('help.steps')}>
          <ol className="space-y-3">
            {topic.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-caption font-semibold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-body text-foreground">{L(s.text)}</p>
                  {s.note ? (
                    <p className="mt-0.5 text-caption text-muted-foreground">{L(s.note)}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {topic.screenshots?.length ? (
          <Section icon={ImageIcon} title={t('help.screenshots')}>
            <div className="grid gap-3 sm:grid-cols-2">
              {topic.screenshots.map((label, i) => (
                <div
                  key={i}
                  className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-caption text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {topic.notes?.length ? (
          <Section icon={AlertTriangle} title={t('help.notes')} tone="info">
            <ul className="space-y-2">
              {topic.notes.map((n, i) => (
                <li key={i} className="text-body text-foreground">
                  {L(n)}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {topic.mistakes?.length ? (
          <Section icon={AlertTriangle} title={t('help.mistakes')} tone="warn">
            <ul className="space-y-2">
              {topic.mistakes.map((m, i) => (
                <li key={i} className="text-body text-foreground">
                  {L(m)}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {topic.faqs?.length ? (
          <Section icon={HelpCircle} title={t('help.faq')}>
            <dl className="divide-y divide-border">
              {topic.faqs.map((f, i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0">
                  <dt className="text-body font-medium text-foreground">{L(f.q)}</dt>
                  <dd className="mt-1 text-body text-muted-foreground">{L(f.a)}</dd>
                </div>
              ))}
            </dl>
          </Section>
        ) : null}

        {topic.related?.length ? (
          <Section icon={ArrowRight} title={t('help.related')}>
            <ul className="flex flex-wrap gap-2">
              {topic.related.map((id) => {
                const r = getTopic(id);
                if (!r) return null;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => onOpen(id)}
                      className="min-h-9 rounded-full border border-border bg-card px-3 text-caption font-medium text-foreground transition-colors duration-150 hover:bg-accent"
                    >
                      {localizedText(r.title, lang)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Section>
        ) : null}
      </div>
    </article>
  );
}

function Section({ icon: Icon, title, children, tone }) {
  const toneCls =
    tone === 'warn'
      ? 'border-warning/30 bg-warning-subtle'
      : tone === 'info'
        ? 'border-primary/20 bg-primary-subtle/40'
        : 'border-border bg-card';
  return (
    <section className={cn('rounded-xl border p-4 shadow-sm', toneCls)}>
      <h2 className="mb-3 flex items-center gap-2 text-section text-foreground">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}
