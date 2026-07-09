import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '@dgp/shared';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useSchemes, useSchemeMutations } from './hooks';
import { ConfirmDialog } from './ConfirmDialog';

const LIMIT = 20;

export function SchemesList() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);

  const params = { page, limit: LIMIT, ...(q ? { q } : {}) };
  const { data, isLoading, isError } = useSchemes(params);
  const m = useSchemeMutations();

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const togglePublish = async (s) => {
    try {
      if (s.isPublished) await m.unpublish.mutateAsync(s.id);
      else await m.publish.mutateAsync(s.id);
      toast.success(s.isPublished ? t('scheme.toast.unpublished') : t('scheme.toast.published'));
    } catch {
      toast.error(t('scheme.toast.actionFailed'));
    }
  };

  const confirmDelete = async () => {
    try {
      await m.remove.mutateAsync(toDelete.id);
      toast.success(t('scheme.toast.deleted'));
    } catch {
      toast.error(t('scheme.toast.actionFailed'));
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">{t('scheme.dash.title')}</h1>
        <Button asChild size="sm">
          <Link to="/schemes/new">
            <Plus className="h-4 w-4" />
            {t('scheme.dash.new')}
          </Link>
        </Button>
      </div>

      <div className="relative mb-4 w-72">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder={t('scheme.dash.search')}
          className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">{t('scheme.dash.scheme')}</th>
              <th className="px-4 py-2 font-medium">{t('scheme.dash.category')}</th>
              <th className="px-4 py-2 font-medium">{t('scheme.dash.state')}</th>
              <th className="px-4 py-2 font-medium">{t('scheme.dash.date')}</th>
              <th className="px-4 py-2 text-right font-medium">{t('scheme.dash.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {t('common.loading')}
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-destructive">
                  {t('scheme.dash.loadError')}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {t('scheme.dash.empty')}
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2">
                    <p className="max-w-xs truncate font-medium text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.schemeId}</p>
                  </td>
                  <td className="px-4 py-2">{t(`scheme.category.${s.category}`, s.category)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.isPublished ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'}`}
                    >
                      {s.isPublished ? t('scheme.state.published') : t('scheme.state.draft')}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatDate(s.createdAt, locale)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" title={t('scheme.dash.edit')}>
                        <Link to={`/schemes/${s.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={
                          s.isPublished ? t('scheme.dash.unpublish') : t('scheme.dash.publish')
                        }
                        onClick={() => togglePublish(s)}
                      >
                        {s.isPublished ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t('scheme.dash.delete')}
                        onClick={() => setToDelete(s)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('scheme.dash.total', { total })}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('scheme.dash.prev')}
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('scheme.dash.next')}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={t('scheme.delete.title')}
        message={t('scheme.delete.message', { title: toDelete?.title })}
        confirmLabel={t('scheme.dash.delete')}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
