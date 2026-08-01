import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { MessageSquare, Star } from 'lucide-react';
import { FEEDBACK_CATEGORIES, FEEDBACK_RATING_MAX } from '@dgp/shared';
import { PageHeader, SectionHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/utils/cn';
import { useFeedbackSummary, useMyFeedback, useSubmitFeedback } from '../hooks';

/**
 * A star rating that is a real radio group underneath: keyboard operable, announced properly,
 * and submitted with the form. A row of clickable icons alone would be none of those things.
 */
function StarRating({ name, value, onChange, label }) {
  const { t } = useTranslation();
  return (
    <fieldset className="min-w-0">
      <legend className="text-label font-medium text-foreground">{label}</legend>
      <div className="mt-1.5 flex gap-1">
        {Array.from({ length: FEEDBACK_RATING_MAX }, (_, i) => i + 1).map((star) => (
          <label
            key={star}
            className="cursor-pointer rounded p-1 focus-within:ring-2 focus-within:ring-ring"
            title={t('feedback.stars', { count: star })}
          >
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="sr-only"
            />
            <Star
              className={cn(
                'h-8 w-8 transition-colors duration-150',
                star <= value ? 'fill-warning text-warning' : 'text-muted-foreground',
              )}
              aria-hidden="true"
            />
            <span className="sr-only">{t('feedback.stars', { count: star })}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ScoreRow({ row }) {
  const { t } = useTranslation();
  return (
    <li className="flex min-h-11 items-center gap-3 px-4 py-2">
      <span className="min-w-0 flex-1 truncate text-body text-foreground">
        {t(`feedback.category.${row.category}`, row.category)}
      </span>
      {row.average == null ? (
        // No ratings yet is not a zero rating.
        <span className="shrink-0 text-caption text-muted-foreground">{t('feedback.noScore')}</span>
      ) : (
        <span className="flex shrink-0 items-center gap-1.5">
          <Star className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />
          <span className="tabular-nums text-body text-foreground">{row.average}</span>
          <span className="text-caption text-muted-foreground">({row.count})</span>
        </span>
      )}
    </li>
  );
}

export function Feedback() {
  const { t } = useTranslation();
  const formId = useId();

  const [category, setCategory] = useState(FEEDBACK_CATEGORIES[0]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const { data: summary } = useFeedbackSummary();
  const { data: mine } = useMyFeedback();
  const submit = useSubmitFeedback();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error(t('feedback.pickRating'));
      return;
    }
    submit.mutate(
      { category, rating, comment, isAnonymous: anonymous },
      {
        onSuccess: () => {
          toast.success(t('feedback.thanks'));
          setRating(0);
          setComment('');
        },
        onError: () => toast.error(t('feedback.failed')),
      },
    );
  };

  return (
    <div className="dgp-page">
      <PageHeader title={t('feedback.title')} subtitle={t('feedback.intro')} />

      <form
        onSubmit={onSubmit}
        className="mb-6 space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs"
      >
        <div className="space-y-1">
          <label htmlFor={`${formId}-cat`} className="block text-label font-medium text-foreground">
            {t('feedback.service')}
          </label>
          <select
            id={`${formId}-cat`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {FEEDBACK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`feedback.category.${c}`, c)}
              </option>
            ))}
          </select>
        </div>

        <StarRating
          name={`${formId}-rating`}
          value={rating}
          onChange={setRating}
          label={t('feedback.rating')}
        />

        <div className="space-y-1">
          <label
            htmlFor={`${formId}-note`}
            className="block text-label font-medium text-foreground"
          >
            {t('feedback.comment')}
          </label>
          <textarea
            id={`${formId}-note`}
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('feedback.commentPlaceholder')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
          />
          <span className="min-w-0 text-body text-foreground">
            {t('feedback.anonymous')}
            <span className="block text-caption text-muted-foreground">
              {t('feedback.anonymousHint')}
            </span>
          </span>
        </label>

        <button
          type="submit"
          disabled={submit.isPending}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-primary px-4 text-caption font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:opacity-50"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          {t('feedback.submit')}
        </button>
      </form>

      <SectionHeader title={t('feedback.villageScores')} />
      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <ul className="divide-y divide-border">
          {(summary?.data ?? []).map((row) => (
            <ScoreRow key={row.category} row={row} />
          ))}
        </ul>
      </div>

      <SectionHeader title={t('feedback.mine')} />
      {mine?.data?.length ? (
        <ul className="grid gap-2">
          {mine.data.map((f) => (
            <li
              key={f.id}
              className="min-w-0 rounded-xl border border-border bg-card p-3 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-body text-foreground">
                  {t(`feedback.category.${f.category}`, f.category)}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden="true" />
                  <span className="tabular-nums text-caption text-foreground">{f.rating}</span>
                </span>
              </div>
              {f.comment ? (
                <p className="mt-1 text-caption text-muted-foreground">{f.comment}</p>
              ) : null}
              {f.isAnonymous ? (
                <p className="mt-1 text-caption text-muted-foreground">
                  {t('feedback.wasAnonymous')}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={MessageSquare} title={t('feedback.noneYet')} />
      )}
    </div>
  );
}
