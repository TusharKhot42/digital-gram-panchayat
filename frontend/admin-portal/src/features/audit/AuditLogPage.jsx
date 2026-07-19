import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { formatDateTime } from '@dgp/shared';
import { Chip } from '@/components/ui/chip';
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
import { useAuditLog } from './hooks';

const LIMIT = 20;
const COLS = 4;

// The entities the trail records — drives the filter dropdown without a backend round-trip.
const ENTITIES = [
  'complaints',
  'notices',
  'schemes',
  'taxrecords',
  'certificateapplications',
  'users',
  'notifications',
];

const ROLE_COLOR = { officer: 'blue', citizen: 'green', system: 'grey' };

export function AuditLogPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');

  const params = {
    page,
    limit: LIMIT,
    ...(entity ? { entity } : {}),
    ...(action ? { action } : {}),
  };
  const { data, isLoading, isError } = useAuditLog(params);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const onFilter = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  return (
    <div>
      <h1 className="mb-1 text-title text-foreground">{t('audit.title')}</h1>
      <p className="mb-4 text-body text-muted-foreground">{t('audit.subtitle')}</p>

      <FilterBar>
        <SearchInput
          value={action}
          onChange={onFilter(setAction)}
          placeholder={t('audit.actionFilter')}
        />
        <Select
          value={entity}
          onChange={(e) => onFilter(setEntity)(e.target.value)}
          aria-label={t('audit.allEntities')}
          className="w-auto"
        >
          <option value="">{t('audit.allEntities')}</option>
          {ENTITIES.map((e) => (
            <option key={e} value={e}>
              {t(`audit.entity.${e}`, e)}
            </option>
          ))}
        </Select>
      </FilterBar>

      <TableShell className="max-h-[calc(100dvh-16rem)] overflow-y-auto">
        <Table>
          <THead>
            <tr>
              <TH>{t('audit.col.when')}</TH>
              <TH>{t('audit.col.actor')}</TH>
              <TH>{t('audit.col.action')}</TH>
              <TH>{t('audit.col.entity')}</TH>
            </tr>
          </THead>
          <TBody>
            {isLoading ? (
              <TableMessageRow colSpan={COLS} className="py-4">
                <SkeletonRows />
              </TableMessageRow>
            ) : isError ? (
              <TableMessageRow colSpan={COLS} className="text-destructive-strong">
                {t('audit.loadError')}
              </TableMessageRow>
            ) : rows.length === 0 ? (
              <TableMessageRow colSpan={COLS} className="p-0">
                <EmptyState
                  icon={ShieldCheck}
                  title={t('audit.empty')}
                  className="border-0 shadow-none"
                />
              </TableMessageRow>
            ) : (
              rows.map((r) => (
                <TR key={r.id}>
                  <TD className="whitespace-nowrap text-muted-foreground">
                    {formatDateTime(r.at, locale)}
                  </TD>
                  <TD>
                    <span className="text-foreground">{r.actorName}</span>
                    <Chip color={ROLE_COLOR[r.actorRole] ?? 'grey'} className="ml-2">
                      {t(`audit.role.${r.actorRole}`, r.actorRole)}
                    </Chip>
                  </TD>
                  <TD className="font-medium text-foreground">{r.action}</TD>
                  <TD className="text-muted-foreground">
                    {t(`audit.entity.${r.entity}`, r.entity)}
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
        totalLabel={t('audit.total', { total })}
      />
    </div>
  );
}
