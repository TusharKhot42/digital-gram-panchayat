import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { CHART_COLORS } from '@dgp/shared';

/**
 * Dashboard chart panels. Split into its own module and lazy-loaded so the heavy `recharts`
 * bundle only downloads when an officer opens the dashboard, not on every admin page.
 */
export default function DashboardCharts({ charts }) {
  const { t } = useTranslation();
  const byCategory = charts?.complaintsByCategory ?? [];
  const byStatus = charts?.complaintsByStatus ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          {t('dashboard.complaintsByCategory')}
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byCategory}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          {t('dashboard.complaintsByStatus')}
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={byStatus} dataKey="value" nameKey="label" outerRadius={80} label>
              {byStatus.map((entry, i) => (
                <Cell key={entry.label} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
