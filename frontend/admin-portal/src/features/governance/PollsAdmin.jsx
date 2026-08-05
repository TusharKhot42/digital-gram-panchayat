import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { controlClass } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { QueryError } from '@/components/QueryError';
import { useAdminPolls, usePollMutations } from './hooks';

export function PollsAdmin() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useAdminPolls();
  const { create, update, remove } = usePollMutations();

  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [options, setOptions] = useState(['', '']);

  const rows = data?.data ?? [];

  const submit = (e) => {
    e.preventDefault();
    create.mutate(
      { values: { question, closesAt: closesAt || undefined, options, isPublished: true } },
      {
        onSuccess: () => {
          toast.success(t('gov.poll.created'));
          setOpen(false);
          setQuestion('');
          setClosesAt('');
          setOptions(['', '']);
        },
        onError: (err) => toast.error(err?.response?.data?.error?.message ?? t('gov.saveFailed')),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-title text-foreground">{t('gov.poll.title')}</h1>
          <p className="mt-0.5 text-caption text-muted-foreground">{t('gov.poll.intro')}</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('gov.poll.new')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-body text-muted-foreground">{t('common.loading')}</p>
      ) : isError ? (
        <QueryError message={t('gov.poll.loadError')} onRetry={refetch} />
      ) : rows.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {rows.map((poll) => (
            <section
              key={poll.id}
              className="min-w-0 rounded-lg border border-border bg-card p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="min-w-0 text-section text-foreground">{poll.question}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('gov.remove')}
                  onClick={() => remove.mutate(poll.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <p className="mt-0.5 text-caption text-muted-foreground">
                {t('gov.poll.totalVotes', { count: poll.totalVotes ?? 0 })} ·{' '}
                {poll.isOpen ? t('gov.poll.open') : t('gov.poll.closed')} ·{' '}
                {poll.isPublished ? t('gov.published') : t('gov.draft')}
              </p>

              {/* Officers always see the tallies; only citizens have them withheld. */}
              <ul className="mt-3 space-y-2">
                {poll.options.map((o) => (
                  <li key={o.id}>
                    <div className="flex items-center justify-between gap-2 text-body">
                      <span className="min-w-0 truncate text-foreground">{o.text}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {o.votes} ({o.percent}%)
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500"
                        style={{ width: `${o.percent}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  update.mutate({ id: poll.id, values: { isPublished: !poll.isPublished } })
                }
              >
                {poll.isPublished ? t('gov.unpublish') : t('gov.publish')}
              </Button>
            </section>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-card px-4 py-10 text-center text-body text-muted-foreground">
          {t('gov.poll.empty')}
        </p>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t('gov.poll.new')}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('common.close')}
            </Button>
            <Button form="poll-form" type="submit" disabled={create.isPending}>
              {t('gov.save')}
            </Button>
          </>
        }
      >
        <form id="poll-form" onSubmit={submit} className="space-y-3">
          <Field label={t('gov.poll.question')}>
            {({ id }) => (
              <input
                id={id}
                required
                className={controlClass}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            )}
          </Field>

          <div className="space-y-2">
            <p className="text-label text-foreground">{t('gov.poll.options')}</p>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={controlClass}
                  value={opt}
                  aria-label={t('gov.poll.option', { number: i + 1 })}
                  placeholder={t('gov.poll.option', { number: i + 1 })}
                  onChange={(e) =>
                    setOptions(options.map((x, j) => (j === i ? e.target.value : x)))
                  }
                />
                {options.length > 2 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t('gov.remove')}
                    onClick={() => setOptions(options.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOptions([...options, ''])}
            >
              <Plus className="h-4 w-4" />
              {t('gov.poll.addOption')}
            </Button>
            {/* Saying this here saves an officer discovering it as a 400. */}
            <p className="text-caption text-muted-foreground">{t('gov.poll.editWarning')}</p>
          </div>

          <Field label={t('gov.poll.closesAt')}>
            {({ id }) => (
              <input
                id={id}
                type="datetime-local"
                className={controlClass}
                value={closesAt}
                onChange={(e) => setClosesAt(e.target.value)}
              />
            )}
          </Field>
        </form>
      </Dialog>
    </div>
  );
}
