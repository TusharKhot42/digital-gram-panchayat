import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { MEETING_TYPES, formatDate, formatTime } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { controlClass } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { QueryError } from '@/components/QueryError';
import {
  TableShell,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  TableMessageRow,
} from '@/components/ui/table';
import { cn } from '@/utils/cn';
import { useAdminMeetings, useMeetingMutations } from './hooks';

const STATUS_STYLES = {
  Live: 'bg-destructive-subtle text-destructive-strong',
  Upcoming: 'bg-primary-subtle text-primary',
  Completed: 'bg-secondary text-secondary-foreground',
};

const EMPTY = {
  title: '',
  meetingType: 'GramSabha',
  scheduledAt: '',
  venue: '',
  description: '',
  isPublished: false,
};

/** Agenda rows are edited as a list and sent as JSON — the API parses either form. */
function AgendaEditor({ items, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <p className="text-label text-foreground">{t('gov.meeting.agenda')}</p>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={controlClass}
            value={item.title}
            aria-label={t('gov.meeting.agendaItem', { number: i + 1 })}
            placeholder={t('gov.meeting.agendaItem', { number: i + 1 })}
            onChange={(e) =>
              onChange(items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('gov.remove')}
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, { title: '' }])}
      >
        <Plus className="h-4 w-4" />
        {t('gov.meeting.addAgenda')}
      </Button>
    </div>
  );
}

export function MeetingsAdmin() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data, isLoading, isError, refetch } = useAdminMeetings();
  const { create, remove } = useMeetingMutations();

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [agenda, setAgenda] = useState([]);
  const [notice, setNotice] = useState(null);
  const [banner, setBanner] = useState(null);

  const rows = data?.data ?? [];
  const set = (key) => (e) =>
    setValues((v) => ({
      ...v,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const submit = (e) => {
    e.preventDefault();
    create.mutate(
      {
        values: { ...values, agenda: agenda.filter((a) => a.title.trim()) },
        files: { notice, banner },
      },
      {
        onSuccess: () => {
          toast.success(t('gov.meeting.created'));
          setOpen(false);
          setValues(EMPTY);
          setAgenda([]);
          setNotice(null);
          setBanner(null);
        },
        onError: () => toast.error(t('gov.saveFailed')),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-title text-foreground">{t('gov.meeting.title')}</h1>
          <p className="mt-0.5 text-caption text-muted-foreground">{t('gov.meeting.intro')}</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('gov.meeting.new')}
        </Button>
      </div>

      <TableShell>
        <Table>
          <THead>
            <TR>
              <TH>{t('gov.meeting.number')}</TH>
              <TH>{t('gov.meeting.name')}</TH>
              <TH>{t('gov.meeting.when')}</TH>
              <TH>{t('gov.status')}</TH>
              <TH>{t('gov.published')}</TH>
              <TH>{t('gov.actions')}</TH>
            </TR>
          </THead>
          <TBody>
            {isLoading ? (
              <TableMessageRow colSpan={6}>{t('common.loading')}</TableMessageRow>
            ) : isError ? (
              // A failed load must not read as 'nothing here yet' — a different fact.
              <TableMessageRow colSpan={6}>
                <QueryError message={t('gov.meeting.loadError')} onRetry={refetch} />
              </TableMessageRow>
            ) : rows.length ? (
              rows.map((m) => (
                <TR key={m.id}>
                  <TD className="whitespace-nowrap tabular-nums">{m.meetingNumber}</TD>
                  <TD>{m.title}</TD>
                  <TD className="whitespace-nowrap">
                    {formatDate(m.scheduledAt, locale)} · {formatTime(m.scheduledAt, locale)}
                  </TD>
                  <TD>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-caption font-medium',
                        STATUS_STYLES[m.status],
                      )}
                    >
                      {t(`gov.meeting.status.${m.status}`, m.status)}
                    </span>
                  </TD>
                  <TD>{m.isPublished ? t('gov.yes') : t('gov.no')}</TD>
                  <TD>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('gov.remove')}
                      onClick={() => remove.mutate(m.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TD>
                </TR>
              ))
            ) : (
              <TableMessageRow colSpan={6}>{t('gov.meeting.empty')}</TableMessageRow>
            )}
          </TBody>
        </Table>
      </TableShell>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t('gov.meeting.new')}
        className="max-w-lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('common.close')}
            </Button>
            <Button form="meeting-form" type="submit" disabled={create.isPending}>
              {t('gov.save')}
            </Button>
          </>
        }
      >
        <form id="meeting-form" onSubmit={submit} className="space-y-3">
          <Field label={t('gov.meeting.name')}>
            {({ id }) => (
              <input
                id={id}
                required
                className={controlClass}
                value={values.title}
                onChange={set('title')}
              />
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('gov.meeting.typeLabel')}>
              {({ id }) => (
                <select
                  id={id}
                  className={controlClass}
                  value={values.meetingType}
                  onChange={set('meetingType')}
                >
                  {MEETING_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`gov.meeting.type.${type}`, type)}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={t('gov.meeting.when')}>
              {({ id }) => (
                <input
                  id={id}
                  required
                  type="datetime-local"
                  className={controlClass}
                  value={values.scheduledAt}
                  onChange={set('scheduledAt')}
                />
              )}
            </Field>
          </div>

          <Field label={t('gov.meeting.venue')}>
            {({ id }) => (
              <input
                id={id}
                className={controlClass}
                value={values.venue}
                onChange={set('venue')}
              />
            )}
          </Field>

          <AgendaEditor items={agenda} onChange={setAgenda} />

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('gov.meeting.noticeFile')}>
              {({ id }) => (
                <input
                  id={id}
                  type="file"
                  accept="application/pdf,image/*"
                  className={controlClass}
                  onChange={(e) => setNotice(e.target.files?.[0] ?? null)}
                />
              )}
            </Field>
            <Field label={t('gov.meeting.bannerFile')}>
              {({ id }) => (
                <input
                  id={id}
                  type="file"
                  accept="image/*"
                  className={controlClass}
                  onChange={(e) => setBanner(e.target.files?.[0] ?? null)}
                />
              )}
            </Field>
          </div>

          <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={values.isPublished} onChange={set('isPublished')} />
            {t('gov.publishNow')}
          </label>
        </form>
      </Dialog>
    </div>
  );
}
