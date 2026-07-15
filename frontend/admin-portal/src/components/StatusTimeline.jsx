import { useTranslation } from 'react-i18next';
import { formatDateTime } from '@dgp/shared';
import { Timeline } from '@/components/Timeline';

/** Complaint status history, rendered on the shared timeline rail. */
export function StatusTimeline({ history = [] }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';

  return (
    <Timeline
      items={history.map((entry) => ({
        key: `${entry.status}-${entry.at}`,
        title: t(`complaint.status.${entry.status}`, entry.status),
        meta: formatDateTime(entry.at, locale),
      }))}
    />
  );
}
