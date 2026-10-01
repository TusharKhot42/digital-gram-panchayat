import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, ShieldCheck, UserPlus } from 'lucide-react';
import { formatDate, WARD_DETAILS } from '@dgp/shared';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
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
import { useUsers } from './hooks';
import { RegisterAdminDialog } from './RegisterAdminDialog';

const LIMIT = 20;
const COLS = 6;

export function UsersList() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { user: currentUser } = useAuth();
  const isRoot = Boolean(currentUser?.isRootAdmin);

  const [q, setQ] = useState('');
  const [ward, setWard] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const params = {
    page,
    limit: LIMIT,
    ...(q ? { q } : {}),
    ...(ward ? { ward } : {}),
    ...(status ? { status } : {}),
  };
  const { data, isLoading, isError } = useUsers(params);
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const onFilter = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-title text-foreground">{t('users.title')}</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admins" className="gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t('admins.title', 'Administrators')}
            </Link>
          </Button>
          {isRoot && (
            <Button size="sm" onClick={() => setIsRegisterOpen(true)} className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              {t('admins.newAdminBtn', 'Register New Admin')}
            </Button>
          )}
        </div>
      </div>

      <FilterBar>
        <SearchInput value={q} onChange={onFilter(setQ)} placeholder={t('users.search')} />
        <Select
          value={ward}
          onChange={(e) => onFilter(setWard)(e.target.value)}
          aria-label={t('users.allWards')}
          className="w-auto"
        >
          <option value="">{t('users.allWards')}</option>
          {WARD_DETAILS.map((w) => (
            <option key={w.id} value={w.id}>
              {locale === 'mr' ? w.name_mr : w.name_en}
            </option>
          ))}
        </Select>
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
              <TH>{t('users.name')}</TH>
              <TH>{t('users.ward')}</TH>
              <TH>{t('users.mobile')}</TH>
              <TH>{t('users.village')}</TH>
              <TH>{t('users.joined')}</TH>
              <TH>{t('users.status')}</TH>
            </tr>
          </THead>
          <TBody>
            {isLoading ? (
              <TableMessageRow colSpan={COLS} className="py-4">
                <SkeletonRows />
              </TableMessageRow>
            ) : isError ? (
              <TableMessageRow colSpan={COLS} className="text-destructive-strong">
                {t('users.loadError')}
              </TableMessageRow>
            ) : rows.length === 0 ? (
              <TableMessageRow colSpan={COLS} className="p-0">
                <EmptyState
                  icon={Users}
                  title={t('users.empty')}
                  className="border-0 shadow-none"
                />
              </TableMessageRow>
            ) : (
              rows.map((u) => (
                <TR key={u.id}>
                  <TD>
                    <Link
                      to={`/users/${u.id}`}
                      className="font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
                    >
                      {u.fullName}
                    </Link>
                  </TD>
                  <TD className="whitespace-nowrap text-xs">
                    {u.ward ? (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                        {locale === 'mr' && WARD_DETAILS[u.ward]?.name_mr
                          ? WARD_DETAILS[u.ward].name_mr
                          : u.ward}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TD>
                  <TD className="text-muted-foreground">{u.mobile || '—'}</TD>
                  <TD className="text-muted-foreground">{u.village || '—'}</TD>
                  <TD className="whitespace-nowrap text-muted-foreground">
                    {formatDate(u.createdAt, locale)}
                  </TD>
                  <TD>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium ring-1 ring-inset ${
                        u.isActive
                          ? 'bg-success-subtle text-success-strong ring-success/20'
                          : 'bg-muted text-body-foreground ring-border'
                      }`}
                    >
                      {u.isActive ? t('users.active') : t('users.inactive')}
                    </span>
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
        totalLabel={t('users.total', { total })}
      />

      {isRoot && (
        <RegisterAdminDialog open={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      )}
    </div>
  );
}
