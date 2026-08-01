import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { DOWNLOAD_CATEGORIES, formatDate } from '@dgp/shared';
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
import { useAdminDocuments, useDocumentMutations } from './hooks';

export function DocumentsAdmin() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data, isLoading } = useAdminDocuments();
  const { create, remove } = useDocumentMutations();

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ title: '', category: 'Form', year: '', description: '' });
  const [file, setFile] = useState(null);

  const rows = data?.data ?? [];
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!file) {
      toast.error(t('gov.doc.fileRequired'));
      return;
    }
    create.mutate(
      { values, files: file },
      {
        onSuccess: () => {
          toast.success(t('gov.doc.created'));
          setOpen(false);
          setValues({ title: '', category: 'Form', year: '', description: '' });
          setFile(null);
        },
        onError: () => toast.error(t('gov.saveFailed')),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-title text-foreground">{t('gov.doc.title')}</h1>
          <p className="mt-0.5 text-caption text-muted-foreground">{t('gov.doc.intro')}</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('gov.doc.new')}
        </Button>
      </div>

      <TableShell>
        <Table>
          <THead>
            <TR>
              <TH>{t('gov.doc.name')}</TH>
              <TH>{t('gov.doc.categoryLabel')}</TH>
              <TH>{t('gov.doc.year')}</TH>
              {/* The count is what tells an officer which forms villagers actually need. */}
              <TH>{t('gov.doc.downloads')}</TH>
              <TH>{t('gov.doc.added')}</TH>
              <TH>{t('gov.actions')}</TH>
            </TR>
          </THead>
          <TBody>
            {isLoading ? (
              <TableMessageRow colSpan={6}>{t('common.loading')}</TableMessageRow>
            ) : rows.length ? (
              rows.map((d) => (
                <TR key={d.id}>
                  <TD>{d.title}</TD>
                  <TD>{t(`gov.doc.categoryName.${d.category}`, d.category)}</TD>
                  <TD className="tabular-nums">{d.year || '—'}</TD>
                  <TD className="tabular-nums">{d.downloadCount}</TD>
                  <TD className="whitespace-nowrap">{formatDate(d.createdAt, locale)}</TD>
                  <TD>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('gov.remove')}
                      onClick={() => remove.mutate(d.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TD>
                </TR>
              ))
            ) : (
              <TableMessageRow colSpan={6}>{t('gov.doc.empty')}</TableMessageRow>
            )}
          </TBody>
        </Table>
      </TableShell>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t('gov.doc.new')}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('common.close')}
            </Button>
            <Button form="doc-form" type="submit" disabled={create.isPending}>
              {t('gov.save')}
            </Button>
          </>
        }
      >
        <form id="doc-form" onSubmit={submit} className="space-y-3">
          <Field label={t('gov.doc.name')}>
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
            <Field label={t('gov.doc.categoryLabel')}>
              {({ id }) => (
                <select
                  id={id}
                  className={controlClass}
                  value={values.category}
                  onChange={set('category')}
                >
                  {DOWNLOAD_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(`gov.doc.categoryName.${c}`, c)}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label={t('gov.doc.year')}>
              {({ id }) => (
                <input
                  id={id}
                  className={controlClass}
                  value={values.year}
                  onChange={set('year')}
                />
              )}
            </Field>
          </div>
          <Field label={t('gov.doc.file')}>
            {({ id }) => (
              <input
                id={id}
                type="file"
                accept="application/pdf,image/*"
                className={controlClass}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            )}
          </Field>
        </form>
      </Dialog>
    </div>
  );
}
