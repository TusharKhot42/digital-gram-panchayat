import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, ShieldAlert, ShieldCheck, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@dgp/shared';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { SkeletonRows } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { FilterBar, SearchInput } from '@/components/FilterBar';
import { Pagination } from '@/components/Pagination';
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
import { useAdmins, useSetUserStatus } from './hooks';
import { RegisterAdminDialog } from './RegisterAdminDialog';

const LIMIT = 20;
const COLS = 6;

export function AdminList() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { user: currentUser } = useAuth();
  const isRoot = Boolean(currentUser?.isRootAdmin);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Status toggle confirmation modal
  const [targetUser, setTargetUser] = useState(null);
  const statusMutation = useSetUserStatus(targetUser?.id);

  const params = {
    page,
    limit: LIMIT,
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
  };

  const { data, isLoading, isError } = useAdmins(params);
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const onFilter = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  const handleStatusConfirm = async () => {
    if (!targetUser) return;
    const nextStatus = targetUser.isActive ? 'inactive' : 'active';
    try {
      await statusMutation.mutateAsync({ id: targetUser.id, status: nextStatus });
      toast.success(
        nextStatus === 'active'
          ? t('admins.activated', 'Administrator account activated')
          : t('admins.deactivated', 'Administrator account deactivated'),
      );
      setTargetUser(null);
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message || t('users.actionFailed', 'Status update failed'),
      );
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title text-foreground">{t('admins.title', 'Administrators')}</h1>
          <p className="mt-0.5 text-caption text-muted-foreground">
            {t(
              'admins.subtitle',
              'Gram Panchayat officers and administrative staff with portal access.',
            )}
          </p>
        </div>

        {isRoot && (
          <Button onClick={() => setIsRegisterOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {t('admins.newAdminBtn', 'Register New Admin')}
          </Button>
        )}
      </div>

      {!isRoot && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            {t(
              'admins.nonRootNotice',
              'You are signed in as an Administrator. Only the Root Admin can register new administrators or modify account access.',
            )}
          </span>
        </div>
      )}

      <FilterBar>
        <SearchInput
          value={q}
          onChange={onFilter(setQ)}
          placeholder={t('admins.search', 'Search administrator name, email, mobile…')}
        />
        <Select
          value={status}
          onChange={(e) => onFilter(setStatus)(e.target.value)}
          aria-label={t('users.allStatuses')}
          className="w-auto"
        >
          <option value="">{t('users.allStatuses')}</option>
          <option value="active">{t('users.active')}</option>
          <option value="inactive">{t('users.inactive')}</option>
        </Select>
      </FilterBar>

      <TableShell className="max-h-[calc(100dvh-16rem)] overflow-y-auto">
        <Table>
          <THead>
            <tr>
              <TH>{t('admins.table.admin', 'Administrator')}</TH>
              <TH>{t('admins.table.role', 'Access Level')}</TH>
              <TH>{t('users.mobile')}</TH>
              <TH>{t('admins.table.village', 'Designation / Village')}</TH>
              <TH>{t('users.joined')}</TH>
              <TH className="text-right">{t('common.actions', 'Action')}</TH>
            </tr>
          </THead>
          <TBody>
            {isLoading ? (
              <TableMessageRow colSpan={COLS} className="py-4">
                <SkeletonRows />
              </TableMessageRow>
            ) : isError ? (
              <TableMessageRow colSpan={COLS} className="text-destructive-strong">
                {t('users.loadError', 'Could not load administrators')}
              </TableMessageRow>
            ) : rows.length === 0 ? (
              <TableMessageRow colSpan={COLS} className="p-0">
                <EmptyState
                  icon={Shield}
                  title={t('admins.empty', 'No administrators match your filters.')}
                  className="border-0 shadow-none"
                />
              </TableMessageRow>
            ) : (
              rows.map((r) => {
                const isTargetRoot = Boolean(r.isRootAdmin);
                const isSelf = String(r.id) === String(currentUser?.id);

                return (
                  <TR key={r.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-caption font-bold ${
                            isTargetRoot
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {r.fullName?.slice(0, 1)?.toUpperCase() || 'A'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <span>{r.fullName}</span>
                            {isSelf && (
                              <span className="text-[10px] text-muted-foreground font-normal">
                                ({t('common.you', 'You')})
                              </span>
                            )}
                          </div>
                          <p className="text-caption text-muted-foreground">{r.email}</p>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      {isTargetRoot ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {t('admins.role.root', 'Root Admin')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800 border border-blue-200">
                          <Shield className="h-3.5 w-3.5" />
                          {t('admins.role.admin', 'Administrator')}
                        </span>
                      )}
                    </TD>
                    <TD className="whitespace-nowrap text-muted-foreground">{r.mobile || '—'}</TD>
                    <TD className="text-muted-foreground">
                      {r.village || r.address || 'Gram Panchayat Office'}
                    </TD>
                    <TD className="whitespace-nowrap text-muted-foreground">
                      {formatDate(r.createdAt, locale)}
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {t('users.active', 'Active')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive-strong">
                            {t('users.inactive', 'Inactive')}
                          </span>
                        )}

                        {isRoot && !isTargetRoot && !isSelf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={
                              r.isActive
                                ? 'text-destructive-strong hover:bg-destructive/10 hover:text-destructive-strong text-xs'
                                : 'text-primary hover:bg-primary/10 text-xs'
                            }
                            onClick={() => setTargetUser(r)}
                          >
                            {r.isActive
                              ? t('users.deactivate', 'Deactivate')
                              : t('users.activate', 'Activate')}
                          </Button>
                        )}
                      </div>
                    </TD>
                  </TR>
                );
              })
            )}
          </TBody>
        </Table>
      </TableShell>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPage={setPage}
        totalLabel={t('admins.total', { total, defaultValue: `${total} administrators` })}
      />

      {/* Register New Admin Modal (Root Admin Only) */}
      {isRoot && (
        <RegisterAdminDialog open={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      )}

      {/* Confirmation Dialog for Activating / Deactivating Administrator */}
      <Dialog
        open={Boolean(targetUser)}
        onClose={() => setTargetUser(null)}
        title={
          targetUser?.isActive
            ? t('admins.confirmDeactivateTitle', 'Deactivate Administrator?')
            : t('admins.confirmActivateTitle', 'Activate Administrator?')
        }
        description={
          targetUser?.isActive
            ? t(
                'admins.confirmDeactivateDesc',
                'This administrator will be immediately blocked from accessing the Gram Panchayat portal.',
              )
            : t(
                'admins.confirmActivateDesc',
                'This administrator will be allowed to log into the Gram Panchayat portal again.',
              )
        }
      >
        <div className="mt-4 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => setTargetUser(null)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant={targetUser?.isActive ? 'destructive' : 'default'}
            loading={statusMutation.isPending}
            onClick={handleStatusConfirm}
          >
            {targetUser?.isActive
              ? t('users.deactivate', 'Deactivate')
              : t('users.activate', 'Activate')}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
