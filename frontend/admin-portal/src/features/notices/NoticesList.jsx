import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Megaphone, Pencil, Trash2, Send, Archive } from 'lucide-react';
import { formatDate } from '@dgp/shared';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useNotices, useNoticeMutations } from './hooks';
import { ConfirmDialog } from './ConfirmDialog';
import { BroadcastDialog } from './BroadcastDialog';

const LIMIT = 20;

export function NoticesList() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [toBroadcast, setToBroadcast] = useState(null);

  const params = { page, limit: LIMIT, ...(q ? { q } : {}) };
  const { data, isLoading, isError } = useNotices(params);
  const m = useNoticeMutations();

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const togglePublish = async (n) => {
    try {
      if (n.isPublished) await m.archive.mutateAsync(n.id);
      else await m.publish.mutateAsync(n.id);
      toast.success(n.isPublished ? t('notice.toast.archived') : t('notice.toast.published'));
    } catch {
      toast.error(t('notice.toast.actionFailed'));
    }
  };

  const confirmDelete = async () => {
    try {
      await m.remove.mutateAsync(toDelete.id);
      toast.success(t('notice.toast.deleted'));
    } catch {
      toast.error(t('notice.toast.actionFailed'));
    } finally {
      setToDelete(null);
    }
  };

  const doBroadcast = async (payload) => {
    try {
      const res = await m.broadcast.mutateAsync({ id: toBroadcast.id, payload });
      toast.success(t('notice.toast.broadcastSent', { count: res.recipientCount }));
      setToBroadcast(null);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('notice.toast.actionFailed'));
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">{t('notice.dash.title')}</h1>
        <Button asChild size="sm">
          <Link to="/notices/new">
            <Plus className="h-4 w-4" />
            {t('notice.dash.new')}
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
          placeholder={t('notice.dash.search')}
          className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">{t('notice.dash.notice')}</th>
              <th className="px-4 py-2 font-medium">{t('notice.dash.category')}</th>
              <th className="px-4 py-2 font-medium">{t('notice.dash.state')}</th>
              <th className="px-4 py-2 font-medium">{t('notice.dash.date')}</th>
              <th className="px-4 py-2 text-right font-medium">{t('notice.dash.actions')}</th>
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
                  {t('notice.dash.loadError')}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {t('notice.dash.empty')}
                </td>
              </tr>
            ) : (
              rows.map((n) => (
                <tr key={n.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2">
                    <p className="max-w-xs truncate font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.noticeId}</p>
                  </td>
                  <td className="px-4 py-2">{t(`notice.category.${n.category}`, n.category)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${n.isPublished ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'}`}
                    >
                      {n.isPublished ? t('notice.state.published') : t('notice.state.draft')}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatDate(n.createdAt, locale)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" title={t('notice.dash.edit')}>
                        <Link to={`/notices/${n.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={n.isPublished ? t('notice.dash.archive') : t('notice.dash.publish')}
                        onClick={() => togglePublish(n)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t('notice.dash.broadcast')}
                        onClick={() => setToBroadcast(n)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t('notice.dash.delete')}
                        onClick={() => setToDelete(n)}
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
        <span>{t('notice.dash.total', { total })}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('notice.dash.prev')}
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
            {t('notice.dash.next')}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={t('notice.delete.title')}
        message={t('notice.delete.message', { title: toDelete?.title })}
        confirmLabel={t('notice.dash.delete')}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />

      <BroadcastDialog
        open={Boolean(toBroadcast)}
        notice={toBroadcast}
        isPending={m.broadcast.isPending}
        onBroadcast={doBroadcast}
        onClose={() => setToBroadcast(null)}
      />

      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Megaphone className="h-4 w-4" />
        {t('notice.dash.hint')}
      </div>
    </div>
  );
}
