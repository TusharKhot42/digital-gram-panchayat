import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Droplets, Clock, Phone, Search, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTimetable } from '@/features/timetable/hooks';

// Schedule data for Ghantagadi & Water Supply with full bilingual support
const GHANTAGADI_SCHEDULE = [
  {
    id: 'g1',
    ward_en: 'Ward 1 & 2',
    ward_mr: 'प्रभाग १ व २',
    timingMorning_en: '07:00 AM – 09:00 AM',
    timingMorning_mr: 'सकाळी ०७:०० – ०९:००',
    timingEvening_en: '04:00 PM – 05:30 PM',
    timingEvening_mr: 'संध्याकाळी ०४:०० – ०५:३०',
    days_en: 'Daily (Mon – Sat)',
    days_mr: 'दररोज (सोम – शनि)',
    driverName_en: 'Ramesh Patil',
    driverName_mr: 'रमेश पाटील',
    driverMobile: '9823012345',
    vehicleNo: 'MH-10-GP-1001',
    status_en: 'Active Morning',
    status_mr: 'सकाळची फेरी सुरू',
  },
  {
    id: 'g2',
    ward_en: 'Ward 3 & 4',
    ward_mr: 'प्रभाग ३ व ४',
    timingMorning_en: '09:00 AM – 11:00 AM',
    timingMorning_mr: 'सकाळी ०९:०० – ११:००',
    timingEvening_en: '05:30 PM – 07:00 PM',
    timingEvening_mr: 'संध्याकाळी ०५:३० – ०७:००',
    days_en: 'Daily (Mon – Sat)',
    days_mr: 'दररोज (सोम – शनि)',
    driverName_en: 'Sanjay Deshmukh',
    driverName_mr: 'संजय देशमुख',
    driverMobile: '9823012346',
    vehicleNo: 'MH-10-GP-1002',
    status_en: 'Scheduled',
    status_mr: 'नियोजित',
  },
  {
    id: 'g3',
    ward_en: 'Ward 5 & 6',
    ward_mr: 'प्रभाग ५ व ६',
    timingMorning_en: '07:30 AM – 09:30 AM',
    timingMorning_mr: 'सकाळी ०७:३० – ०९:३०',
    timingEvening_en: '04:30 PM – 06:00 PM',
    timingEvening_mr: 'संध्याकाळी ०४:३० – ०६:००',
    days_en: 'Daily (Mon – Sat)',
    days_mr: 'दररोज (सोम – शनि)',
    driverName_en: 'Vikram Shinde',
    driverName_mr: 'विक्रम शिंदे',
    driverMobile: '9823012347',
    vehicleNo: 'MH-10-GP-1003',
    status_en: 'Active Morning',
    status_mr: 'सकाळची फेरी सुरू',
  },
];

const WATER_SCHEDULE = [
  {
    id: 'w1',
    zone_en: 'Ward 1 & 2',
    zone_mr: 'प्रभाग १ व २',
    timing_en: '06:00 AM – 07:30 AM',
    timing_mr: 'सकाळी ०६:०० – ०७:३०',
    frequency_en: 'Daily Morning',
    frequency_mr: 'दररोज सकाळी',
    operatorName_en: 'Suresh More',
    operatorName_mr: 'सुरेश मोरे',
    operatorMobile: '9890123456',
    source_en: 'Main Elevated Reservoir A',
    source_mr: 'मुख्य जलकुंभ अ',
    status_en: 'Active Now',
    status_mr: 'सध्या सुरू',
  },
  {
    id: 'w2',
    zone_en: 'Ward 3 & 4',
    zone_mr: 'प्रभाग ३ व ४',
    timing_en: '07:30 AM – 09:00 AM',
    timing_mr: 'सकाळी ०७:३० – ०९:००',
    frequency_en: 'Daily Morning',
    frequency_mr: 'दररोज सकाळी',
    operatorName_en: 'Prakash Jadhav',
    operatorName_mr: 'प्रकाश जाधव',
    operatorMobile: '9890123457',
    source_en: 'Elevated Reservoir B',
    source_mr: 'जलकुंभ ब',
    status_en: 'Upcoming',
    status_mr: 'आगामी',
  },
  {
    id: 'w3',
    zone_en: 'Ward 5 & 6',
    zone_mr: 'प्रभाग ५ व ६',
    timing_en: '05:00 PM – 06:30 PM',
    timing_mr: 'संध्याकाळी ०५:०० – ०६:३०',
    frequency_en: 'Daily Evening',
    frequency_mr: 'दररोज संध्याकाळी',
    operatorName_en: 'Mahesh Kadam',
    operatorName_mr: 'महेश कदम',
    operatorMobile: '9890123458',
    source_en: 'South Pump House',
    source_mr: 'दक्षिण पंप हाऊस',
    status_en: 'Evening Shift',
    status_mr: 'संध्याकाळची फेरी',
  },
];

export function Timetable() {
  const { t, i18n } = useTranslation();
  const isMr = (i18n.language || '').toLowerCase().startsWith('mr');

  const [activeTab, setActiveTab] = useState('ghantagadi'); // 'ghantagadi' | 'water'
  const [search, setSearch] = useState('');

  const { data: liveTimetable } = useTimetable();
  const currentGhantagadi = liveTimetable?.ghantagadi?.length
    ? liveTimetable.ghantagadi
    : GHANTAGADI_SCHEDULE;
  const currentWater = liveTimetable?.water?.length ? liveTimetable.water : WATER_SCHEDULE;

  const filteredGhantagadi = currentGhantagadi.filter((item) => {
    const q = search.toLowerCase();
    return (
      (item.ward_en || '').toLowerCase().includes(q) ||
      (item.ward_mr || '').toLowerCase().includes(q) ||
      (item.driverName_en || '').toLowerCase().includes(q) ||
      (item.driverName_mr || '').toLowerCase().includes(q) ||
      (item.vehicleNo || '').toLowerCase().includes(q)
    );
  });

  const filteredWater = currentWater.filter((item) => {
    const q = search.toLowerCase();
    return (
      (item.zone_en || '').toLowerCase().includes(q) ||
      (item.zone_mr || '').toLowerCase().includes(q) ||
      (item.operatorName_en || '').toLowerCase().includes(q) ||
      (item.operatorName_mr || '').toLowerCase().includes(q) ||
      (item.source_en || '').toLowerCase().includes(q) ||
      (item.source_mr || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="dgp-page-wide space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display font-bold tracking-tight text-foreground">
            {t('timetable.title')}
          </h1>
          <p className="mt-1 text-body text-muted-foreground">{t('timetable.subtitle')}</p>
        </div>

        {/* Tab Selector */}
        <div className="inline-flex rounded-2xl border border-border bg-card p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('ghantagadi')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-caption font-semibold transition-all duration-150 ${
              activeTab === 'ghantagadi'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>{t('timetable.ghantagadiTab')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('water')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-caption font-semibold transition-all duration-150 ${
              activeTab === 'water'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Droplets className="h-4 w-4" />
            <span>{t('timetable.waterTab')}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('timetable.searchPlaceholder')}
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-caption text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Tab Content: Ghantagadi */}
      {activeTab === 'ghantagadi' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 dark:bg-emerald-950/20">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="space-y-1">
                <h3 className="text-body font-semibold text-foreground">
                  {t('timetable.ghantagadiGuideTitle')}
                </h3>
                <p className="text-caption text-muted-foreground">
                  {t('timetable.ghantagadiGuideDesc')}
                </p>
              </div>
            </div>
          </div>

          {filteredGhantagadi.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              {t('timetable.noRecords')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredGhantagadi.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col justify-between p-5 transition-shadow hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <Truck className="h-5 w-5" />
                        </span>
                        <div>
                          <h4 className="text-body font-bold text-foreground">
                            {isMr ? item.ward_mr : item.ward_en}
                          </h4>
                          <span className="text-caption text-muted-foreground">
                            {t('timetable.vehicle')}: {item.vehicleNo}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        {isMr ? item.status_mr : item.status_en}
                      </span>
                    </div>

                    <div className="space-y-2 rounded-xl bg-secondary/50 p-3 text-caption">
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          <strong>{t('timetable.morning')}:</strong>{' '}
                          {isMr ? item.timingMorning_mr : item.timingMorning_en}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          <strong>{t('timetable.evening')}:</strong>{' '}
                          {isMr ? item.timingEvening_mr : item.timingEvening_en}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>
                          {t('timetable.days')}: {isMr ? item.days_mr : item.days_en}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">
                        {t('timetable.driver')}: {isMr ? item.driverName_mr : item.driverName_en}
                      </p>
                    </div>
                    <a
                      href={`tel:${item.driverMobile}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-caption font-semibold text-primary-foreground hover:bg-primary-hover"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{t('timetable.callDriver')}</span>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Water Supply */}
      {activeTab === 'water' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 dark:bg-sky-950/20">
            <div className="flex items-start gap-3">
              <Droplets className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
              <div className="space-y-1">
                <h3 className="text-body font-semibold text-foreground">
                  {t('timetable.waterGuideTitle')}
                </h3>
                <p className="text-caption text-muted-foreground">
                  {t('timetable.waterGuideDesc')}
                </p>
              </div>
            </div>
          </div>

          {filteredWater.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              {t('timetable.noRecords')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredWater.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col justify-between p-5 transition-shadow hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                          <Droplets className="h-5 w-5" />
                        </span>
                        <div>
                          <h4 className="text-body font-bold text-foreground">
                            {isMr ? item.zone_mr : item.zone_en}
                          </h4>
                          <span className="text-caption text-muted-foreground">
                            {t('timetable.source')}: {isMr ? item.source_mr : item.source_en}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                        {isMr ? item.status_mr : item.status_en}
                      </span>
                    </div>

                    <div className="space-y-2 rounded-xl bg-secondary/50 p-3 text-caption">
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          <strong>{t('timetable.supplyTiming')}:</strong>{' '}
                          {isMr ? item.timing_mr : item.timing_en}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>
                          {t('timetable.frequency')}: {isMr ? item.frequency_mr : item.frequency_en}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">
                        {t('timetable.operator')}:{' '}
                        {isMr ? item.operatorName_mr : item.operatorName_en}
                      </p>
                    </div>
                    <a
                      href={`tel:${item.operatorMobile}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-caption font-semibold text-primary-foreground hover:bg-primary-hover"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{t('timetable.callOperator')}</span>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
