import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Eye, EyeOff, Landmark } from 'lucide-react';
import { formatDate } from '@dgp/shared';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { SkeletonRows } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { FilterBar, SearchInput } from '@/components/FilterBar';
import { Pagination } from '@/components/Pagination';
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
import { useSchemes, useSchemeMutations } from './hooks';
import { ConfirmDialog } from './ConfirmDialog';

const LIMIT = 20;
const COLS = 5;

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
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-title text-foreground">{t('scheme.dash.title')}</h1>
        <Button asChild size="sm">
          <Link to="/schemes/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('scheme.dash.new')}
          </Link>
        </Button>
      </div>

      <FilterBar>
        <SearchInput
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder={t('scheme.dash.search')}
        />
      </FilterBar>

      <TableShell className="max-h-[calc(100dvh-16rem)] overflow-y-auto">
        <Table>
          <THead>
            <tr>
              <TH>{t('scheme.dash.scheme')}</TH>
              <TH>{t('scheme.dash.category')}</TH>
              <TH>{t('scheme.dash.state')}</TH>
              <TH>{t('scheme.dash.date')}</TH>
              <TH className="text-right">{t('scheme.dash.actions')}</TH>
            </tr>
          </THead>
          <TBody>
            {isLoading ? (
              <TableMessageRow colSpan={COLS} className="py-4">
                <SkeletonRows />
              </TableMessageRow>
            ) : isError ? (
              <TableMessageRow colSpan={COLS} className="text-destructive-strong">
                {t('scheme.dash.loadError')}
              </TableMessageRow>
            ) : rows.length === 0 ? (
              <TableMessageRow colSpan={COLS} className="p-0">
                <EmptyState
                  icon={Landmark}
                  title={t('scheme.dash.empty')}
                  className="border-0 shadow-none"
                  action={
                    <Button asChild size="sm">
                      <Link to="/schemes/new">{t('scheme.dash.new')}</Link>
                    </Button>
                  }
                />
              </TableMessageRow>
            ) : (
              rows.map((s) => (
                <TR key={s.id}>
                  <TD>
                    <p className="max-w-xs truncate font-medium text-foreground">{s.title}</p>
                    <p className="text-caption text-muted-foreground">{s.schemeId}</p>
                  </TD>
                  <TD>{t(`scheme.category.${s.category}`, s.category)}</TD>
                  <TD>
                    <Chip color={s.isPublished ? 'green' : 'grey'}>
                      {s.isPublished ? t('scheme.state.published') : t('scheme.state.draft')}
                    </Chip>
                  </TD>
                  <TD className="whitespace-nowrap text-muted-foreground">
                    {formatDate(s.createdAt, locale)}
                  </TD>
                  <TD>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label={t('scheme.dash.edit')}
                        title={t('scheme.dash.edit')}
                      >
                        <Link to={`/schemes/${s.id}/edit`}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          s.isPublished ? t('scheme.dash.unpublish') : t('scheme.dash.publish')
                        }
                        title={
                          s.isPublished ? t('scheme.dash.unpublish') : t('scheme.dash.publish')
                        }
                        onClick={() => togglePublish(s)}
                      >
                        {s.isPublished ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('scheme.dash.delete')}
                        title={t('scheme.dash.delete')}
                        onClick={() => setToDelete(s)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </TableShell>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPage={setPage}
        totalLabel={t('scheme.dash.total', { total })}
      />

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
