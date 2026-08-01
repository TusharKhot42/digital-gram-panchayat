import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { PROJECT_CATEGORIES, PROJECT_STATUSES, FUNDING_SOURCES, formatCurrency } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { controlClass } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
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
import { useAdminProjects, useProjectMutations } from './hooks';

const EMPTY = {
  name: '',
  category: 'Road',
  status: 'Planned',
  fundingSource: 'FinanceCommission',
  budget: '',
  amountSpent: '',
  progress: '0',
  contractor: '',
  engineer: '',
  location: '',
  startDate: '',
  endDate: '',
  isPublished: false,
};

export function ProjectsAdmin() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data, isLoading } = useAdminProjects();
  const { create, remove } = useProjectMutations();

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [photos, setPhotos] = useState([]);

  const rows = data?.data ?? [];
  const set = (key) => (e) =>
    setValues((v) => ({
      ...v,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const submit = (e) => {
    e.preventDefault();
    create.mutate(
      { values, files: photos },
      {
        onSuccess: () => {
          toast.success(t('gov.project.created'));
          setOpen(false);
          setValues(EMPTY);
          setPhotos([]);
        },
        // The API rejects an impossible progress figure rather than silently fixing it.
        onError: (err) => toast.error(err?.response?.data?.error?.message ?? t('gov.saveFailed')),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-title text-foreground">{t('gov.project.title')}</h1>
          <p className="mt-0.5 text-caption text-muted-foreground">{t('gov.project.intro')}</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('gov.project.new')}
        </Button>
      </div>

      <TableShell>
        <Table>
          <THead>
            <TR>
              <TH>{t('gov.project.number')}</TH>
              <TH>{t('gov.project.name')}</TH>
              <TH>{t('gov.status')}</TH>
              <TH>{t('gov.project.progress')}</TH>
              <TH>{t('gov.project.budget')}</TH>
              <TH>{t('gov.published')}</TH>
              <TH>{t('gov.actions')}</TH>
            </TR>
          </THead>
          <TBody>
            {isLoading ? (
              <TableMessageRow colSpan={7}>{t('common.loading')}</TableMessageRow>
            ) : rows.length ? (
              rows.map((p) => (
                <TR key={p.id}>
                  <TD className="whitespace-nowrap tabular-nums">{p.projectNumber}</TD>
                  <TD>{p.name}</TD>
                  <TD>{t(`gov.project.status.${p.status}`, p.status)}</TD>
                  <TD className="tabular-nums">{p.progress}%</TD>
                  <TD className="whitespace-nowrap tabular-nums">
                    {formatCurrency(p.amountSpent, locale)} / {formatCurrency(p.budget, locale)}
                    <span className="ml-1 text-muted-foreground">({p.utilisation}%)</span>
                  </TD>
                  <TD>{p.isPublished ? t('gov.yes') : t('gov.no')}</TD>
                  <TD>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('gov.remove')}
                      onClick={() => remove.mutate(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TD>
                </TR>
              ))
            ) : (
              <TableMessageRow colSpan={7}>{t('gov.project.empty')}</TableMessageRow>
            )}
          </TBody>
        </Table>
      </TableShell>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t('gov.project.new')}
        className="max-w-lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('common.close')}
            </Button>
            <Button form="project-form" type="submit" disabled={create.isPending}>
              {t('gov.save')}
            </Button>
          </>
        }
      >
        <form id="project-form" onSubmit={submit} className="space-y-3">
          <Field label={t('gov.project.name')}>
            {({ id }) => (
              <input
                id={id}
                required
                className={controlClass}
                value={values.name}
                onChange={set('name')}
              />
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('gov.project.categoryLabel')}>
              {({ id }) => (
                <select
                  id={id}
                  className={controlClass}
                  value={values.category}
                  onChange={set('category')}
                >
                  {PROJECT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(`gov.project.category.${c}`, c)}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={t('gov.status')}>
              {({ id }) => (
                <select
                  id={id}
                  className={controlClass}
                  value={values.status}
                  onChange={set('status')}
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t(`gov.project.status.${s}`, s)}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('gov.project.budget')} hint={t('gov.project.budgetHint')}>
              {({ id }) => (
                <input
                  id={id}
                  type="number"
                  min="0"
                  className={controlClass}
                  value={values.budget}
                  onChange={set('budget')}
                />
              )}
            </Field>
            <Field label={t('gov.project.spent')}>
              {({ id }) => (
                <input
                  id={id}
                  type="number"
                  min="0"
                  className={controlClass}
                  value={values.amountSpent}
                  onChange={set('amountSpent')}
                />
              )}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('gov.project.fundingLabel')}>
              {({ id }) => (
                <select
                  id={id}
                  className={controlClass}
                  value={values.fundingSource}
                  onChange={set('fundingSource')}
                >
                  {FUNDING_SOURCES.map((f) => (
                    <option key={f} value={f}>
                      {t(`gov.project.funding.${f}`, f)}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={t('gov.project.progress')}>
              {({ id }) => (
                <input
                  id={id}
                  type="number"
                  min="0"
                  max="100"
                  className={controlClass}
                  value={values.progress}
                  onChange={set('progress')}
                />
              )}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('gov.project.contractor')}>
              {({ id }) => (
                <input
                  id={id}
                  className={controlClass}
                  value={values.contractor}
                  onChange={set('contractor')}
                />
              )}
            </Field>
            <Field label={t('gov.project.engineer')}>
              {({ id }) => (
                <input
                  id={id}
                  className={controlClass}
                  value={values.engineer}
                  onChange={set('engineer')}
                />
              )}
            </Field>
          </div>

          <Field label={t('gov.project.location')}>
            {({ id }) => (
              <input
                id={id}
                className={controlClass}
                value={values.location}
                onChange={set('location')}
              />
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('gov.project.start')}>
              {({ id }) => (
                <input
                  id={id}
                  type="date"
                  className={controlClass}
                  value={values.startDate}
                  onChange={set('startDate')}
                />
              )}
            </Field>
            <Field label={t('gov.project.end')}>
              {({ id }) => (
                <input
                  id={id}
                  type="date"
                  className={controlClass}
                  value={values.endDate}
                  onChange={set('endDate')}
                />
              )}
            </Field>
          </div>

          <Field label={t('gov.project.photos')}>
            {({ id }) => (
              <input
                id={id}
                type="file"
                accept="image/*"
                multiple
                className={controlClass}
                onChange={(e) => setPhotos([...(e.target.files ?? [])].slice(0, 6))}
              />
            )}
          </Field>

          <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={values.isPublished} onChange={set('isPublished')} />
            {t('gov.publishNow')}
          </label>
        </form>
      </Dialog>
    </div>
  );
}
