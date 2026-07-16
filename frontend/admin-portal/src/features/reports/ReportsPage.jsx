import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  FileText,
  Receipt,
  Users,
  Landmark,
  Megaphone,
  Download,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QueryError } from '@/components/QueryError';
import { Skeleton } from '@/components/Skeleton';
import { useReport } from './hooks';
import { exportCsv, exportExcel, exportPdf } from './exporters';

/** One module's numbers: headline tiles + a labelled breakdown list. */
function Section({ icon: Icon, title, tiles, breakdowns, t }) {
  return (
    <Card className="print:break-inside-avoid print:shadow-none">
      <h2 className="flex items-center gap-2 border-b border-border px-5 py-3 text-section text-foreground">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        {title}
      </h2>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap gap-6">
          {tiles.map(([label, value]) => (
            <div key={label}>
              <p className="text-caption text-muted-foreground">{label}</p>
              <p className="text-title tabular-nums text-foreground">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {breakdowns.map(([label, items, i18nPrefix]) => (
            <div key={label}>
              <h3 className="mb-1.5 text-label text-muted-foreground">{label}</h3>
              <ul className="divide-y divide-border rounded-md border border-border">
                {items.length ? (
                  items.map((item) => (
                    <li
                      key={String(item.label)}
                      className="flex justify-between gap-2 px-3 py-1.5 text-body"
                    >
                      <span className="text-foreground">
                        {i18nPrefix
                          ? t(`${i18nPrefix}.${item.label}`, String(item.label))
                          : String(item.label)}
                      </span>
                      <span className="font-medium tabular-nums text-foreground">{item.value}</span>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-1.5 text-body text-muted-foreground">—</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: r, isLoading, isError, refetch, isFetching } = useReport();

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    );
  if (isError || !r)
    return (
      <QueryError
        message={t('reports.loadError')}
        onRetry={() => refetch()}
        isFetching={isFetching}
      />
    );

  const yesNo = (items, yes, no) =>
    (items ?? []).map((x) => ({
      label: x.label === true || x.label === 'true' ? yes : no,
      value: x.value,
    }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-title text-foreground">{t('reports.title')}</h1>
          <p className="mt-0.5 text-caption text-muted-foreground">
            {t('reports.generatedAt')}: {formatDateTime(r.generatedAt, locale)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCsv(r, t)}>
            <Download className="h-4 w-4" aria-hidden="true" />
            {t('reports.exportCsv')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportExcel(r, t)}>
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            {t('reports.exportExcel')}
          </Button>
          <Button variant="outline" size="sm" onClick={exportPdf}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            {t('reports.exportPdf')}
          </Button>
        </div>
      </div>

      {/* Print-only header so the PDF carries a title. */}
      <div className="hidden print:block">
        <h1 className="text-title text-foreground">{t('reports.title')}</h1>
        <p className="text-caption text-muted-foreground">
          {t('reports.generatedAt')}: {formatDateTime(r.generatedAt, locale)}
        </p>
      </div>

      <Section
        icon={ClipboardList}
        title={t('reports.section.complaints')}
        t={t}
        tiles={[[t('reports.total'), r.complaints.total]]}
        breakdowns={[
          [t('reports.byStatus'), r.complaints.byStatus, 'complaint.status'],
          [t('reports.byCategory'), r.complaints.byCategory, 'complaint.category'],
        ]}
      />
      <Section
        icon={FileText}
        title={t('reports.section.certificates')}
        t={t}
        tiles={[[t('reports.total'), r.certificates.total]]}
        breakdowns={[
          [t('reports.byStatus'), r.certificates.byStatus, 'dakhala.status'],
          [t('reports.byType'), r.certificates.byType, 'dakhala.type'],
        ]}
      />
      <Section
        icon={Receipt}
        title={t('reports.section.tax')}
        t={t}
        tiles={[
          [t('reports.total'), r.tax.total],
          [t('reports.assessed'), formatCurrency(r.tax.assessed, locale)],
          [t('reports.collected'), formatCurrency(r.tax.collected, locale)],
          [t('reports.outstanding'), formatCurrency(r.tax.outstanding, locale)],
        ]}
        breakdowns={[[t('reports.byStatus'), r.tax.byStatus, 'tax.status']]}
      />
      <Section
        icon={Users}
        title={t('reports.section.users')}
        t={t}
        tiles={[[t('reports.total'), r.users.total]]}
        breakdowns={[
          [
            t('reports.byStatus'),
            yesNo(r.users.byActive, t('users.active'), t('users.inactive')),
            null,
          ],
        ]}
      />
      <Section
        icon={Landmark}
        title={t('reports.section.schemes')}
        t={t}
        tiles={[[t('reports.total'), r.schemes.total]]}
        breakdowns={[
          [
            t('reports.byStatus'),
            yesNo(r.schemes.byPublished, t('scheme.state.published'), t('scheme.state.draft')),
            null,
          ],
        ]}
      />
      <Section
        icon={Megaphone}
        title={t('reports.section.notices')}
        t={t}
        tiles={[
          [t('reports.total'), r.notices.total],
          [t('reports.published'), r.notices.published],
        ]}
        breakdowns={[[t('reports.byCategory'), r.notices.byCategory, 'notice.category']]}
      />
    </div>
  );
}
