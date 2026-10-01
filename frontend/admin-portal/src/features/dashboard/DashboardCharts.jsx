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
import { Card, CardContent } from '@/components/ui/card';

/** Recharts renders its tooltip outside our CSS, so it's styled inline from the tokens. */
const TOOLTIP_STYLE = {
  borderRadius: '10px',
  border: '1px solid hsl(var(--border))',
  background: 'hsl(var(--card))',
  color: 'hsl(var(--foreground))',
  fontSize: '0.8125rem',
  boxShadow: '0 4px 12px rgb(16 24 40 / 0.08)',
};

const AXIS_TICK = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' };

function ChartPanel({ title, children }) {
  return (
    <Card>
      <h2 className="border-b border-border px-5 py-3 text-section text-foreground">{title}</h2>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

/**
 * Dashboard chart panels. Split into its own module and lazy-loaded so the heavy `recharts`
 * bundle only downloads when an officer opens the dashboard, not on every admin page.
 */
export default function DashboardCharts({ charts }) {
  const { t } = useTranslation();
  const byCategory = charts?.complaintsByCategory ?? [];
  const byStatus = charts?.complaintsByStatus ?? [];
  const byWard = charts?.complaintsByWard ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <ChartPanel title={t('dashboard.complaintsByCategory')}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byCategory}>
            <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'hsl(var(--muted) / 0.4)' }} />
            <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title={t('dashboard.wardComplaints')}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byWard}>
            <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'hsl(var(--muted) / 0.4)' }} />
            <Bar
              dataKey="value"
              fill={CHART_COLORS[2 % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title={t('dashboard.complaintsByStatus')}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={byStatus} dataKey="value" nameKey="label" outerRadius={80} label>
              {byStatus.map((entry, i) => (
                <Cell key={entry.label} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
}
