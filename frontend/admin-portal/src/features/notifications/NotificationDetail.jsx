import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '@dgp/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { PageHeader } from '@/components/PageHeader';
import { TableShell, Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { useBroadcastRecipients } from './hooks';

const STATUS_COLOR = {
  queued: 'blue',
  sent: 'blue',
  delivered: 'green',
  failed: 'red',
};

/** Recipient-level breakdown for one broadcast (drill-in from the rollup dashboard). */
export function NotificationDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data, isLoading, isError } = useBroadcastRecipients(id);

  if (isLoading) return <p className="text-body text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !data)
    return <p className="text-body text-destructive-strong">{t('ntf.notFound')}</p>;

  const { broadcast: b, recipients, total } = data;

  return (
    <div className="max-w-3xl">
      <PageHeader backTo="/notifications" backLabel={t('ntf.back')} title={b.title} />

      <Card className="mb-4">
        <CardContent className="p-5">
          <p className="whitespace-pre-wrap text-body text-body-foreground">{b.message}</p>
          <p className="mt-3 text-caption text-muted-foreground">
            {(b.channels || []).join(', ')} · {formatDateTime(b.createdAt, locale)} ·{' '}
            {t('ntf.recipientsCount', { count: total })}
          </p>
        </CardContent>
      </Card>

      <TableShell className="max-h-[calc(100dvh-22rem)] overflow-y-auto">
        <Table>
          <THead>
            <tr>
              <TH>{t('ntf.detail.recipient')}</TH>
              <TH>{t('ntf.col.mobile')}</TH>
              <TH>{t('ntf.col.status')}</TH>
              <TH>{t('ntf.col.read')}</TH>
            </tr>
          </THead>
          <TBody>
            {recipients.map((r) => (
              <TR key={r.id}>
                <TD>{r.name || '—'}</TD>
                <TD className="tabular-nums text-muted-foreground">{r.mobile || '—'}</TD>
                <TD>
                  <Chip color={STATUS_COLOR[r.status] ?? 'grey'}>
                    {t(`ntf.status.${r.status}`, r.status)}
                  </Chip>
                </TD>
                <TD className="text-muted-foreground">
                  {r.read ? t('ntf.readYes') : t('ntf.readNo')}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableShell>
    </div>
  );
}
