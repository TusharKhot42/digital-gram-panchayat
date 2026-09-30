import { useState } from 'react';
import { Truck, Droplets, Clock, Phone, Search, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Mock schedule data for Ghantagadi & Water Supply
const GHANTAGADI_SCHEDULE = [
  {
    id: 'g1',
    ward: 'Ward 1 & 2 (Main Bazaar & Gaothan)',
    timingMorning: '07:00 AM – 09:00 AM',
    timingEvening: '04:00 PM – 05:30 PM',
    days: 'Daily (Mon – Sat)',
    driverName: 'Ramesh Patil',
    driverMobile: '9823012345',
    vehicleNo: 'MH-10-GP-1001',
    status: 'Active Morning',
  },
  {
    id: 'g2',
    ward: 'Ward 3 & 4 (Shivaji Nagar & School Area)',
    timingMorning: '09:00 AM – 11:00 AM',
    timingEvening: '05:30 PM – 07:00 PM',
    days: 'Daily (Mon – Sat)',
    driverName: 'Sanjay Deshmukh',
    driverMobile: '9823012346',
    vehicleNo: 'MH-10-GP-1002',
    status: 'Scheduled',
  },
  {
    id: 'g3',
    ward: 'Ward 5 & 6 (Temple Area & New Colony)',
    timingMorning: '07:30 AM – 09:30 AM',
    timingEvening: '04:30 PM – 06:00 PM',
    days: 'Daily (Mon – Sat)',
    driverName: 'Vikram Shinde',
    driverMobile: '9823012347',
    vehicleNo: 'MH-10-GP-1003',
    status: 'Active Morning',
  },
  {
    id: 'g4',
    ward: 'Ward 7 & 8 (Industrial & Outer Ward)',
    timingMorning: '10:00 AM – 12:00 PM',
    timingEvening: '06:00 PM – 07:30 PM',
    days: 'Mon, Wed, Fri',
    driverName: 'Anand Pawar',
    driverMobile: '9823012348',
    vehicleNo: 'MH-10-GP-1004',
    status: 'Scheduled',
  },
];

const WATER_SCHEDULE = [
  {
    id: 'w1',
    zone: 'Zone A — Ward 1 & 2 (North Sector)',
    timing: '06:00 AM – 07:30 AM',
    frequency: 'Daily Morning',
    operatorName: 'Suresh More',
    operatorMobile: '9890123456',
    source: 'Main Elevated Reservoir A',
    status: 'Active Now',
  },
  {
    id: 'w2',
    zone: 'Zone B — Ward 3 & 4 (Central Sector)',
    timing: '07:30 AM – 09:00 AM',
    frequency: 'Daily Morning',
    operatorName: 'Prakash Jadhav',
    operatorMobile: '9890123457',
    source: 'Elevated Reservoir B',
    status: 'Upcoming',
  },
  {
    id: 'w3',
    zone: 'Zone C — Ward 5 & 6 (East Sector)',
    timing: '05:00 PM – 06:30 PM',
    frequency: 'Alternate Days (Mon, Wed, Fri)',
    operatorName: 'Mahesh Kadam',
    operatorMobile: '9890123458',
    source: 'South Pump House',
    status: 'Evening Shift',
  },
  {
    id: 'w4',
    zone: 'Zone D — Ward 7 & 8 (West Sector)',
    timing: '06:30 PM – 08:00 PM',
    frequency: 'Alternate Days (Tue, Thu, Sat)',
    operatorName: 'Ganesh Chavan',
    operatorMobile: '9890123459',
    source: 'West Distribution Tank',
    status: 'Scheduled',
  },
];

export function Timetable() {
  const [activeTab, setActiveTab] = useState('ghantagadi'); // 'ghantagadi' | 'water'
  const [search, setSearch] = useState('');

  const filteredGhantagadi = GHANTAGADI_SCHEDULE.filter(
    (item) =>
      item.ward.toLowerCase().includes(search.toLowerCase()) ||
      item.driverName.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredWater = WATER_SCHEDULE.filter(
    (item) =>
      item.zone.toLowerCase().includes(search.toLowerCase()) ||
      item.operatorName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="dgp-page-wide space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display font-bold tracking-tight text-foreground">
            Gram Panchayat Timetable
          </h1>
          <p className="mt-1 text-body text-muted-foreground">
            Live schedule for Ghantagadi waste collection and Water Supply distribution
          </p>
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
            <span>Ghantagadi Schedule</span>
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
            <span>Water Supply Schedule</span>
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
          placeholder="Filter by Ward, Area, or Operator…"
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
                  Ghantagadi Garbage Collection Guidelines
                </h3>
                <p className="text-caption text-muted-foreground">
                  Keep wet waste (Green Bin) and dry waste (Blue Bin) segregated. Hand over waste
                  directly to the Ghantagadi vehicle staff.
                </p>
              </div>
            </div>
          </div>

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
                        <h4 className="text-body font-bold text-foreground">{item.ward}</h4>
                        <span className="text-caption text-muted-foreground">
                          Vehicle: {item.vehicleNo}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-2 rounded-xl bg-secondary/50 p-3 text-caption">
                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        <strong>Morning:</strong> {item.timingMorning}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        <strong>Evening:</strong> {item.timingEvening}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>Days: {item.days}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      Driver: {item.driverName}
                    </p>
                  </div>
                  <a
                    href={`tel:${item.driverMobile}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-caption font-semibold text-primary-foreground hover:bg-primary-hover"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Driver</span>
                  </a>
                </div>
              </Card>
            ))}
          </div>
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
                  Water Supply & Storage Guidelines
                </h3>
                <p className="text-caption text-muted-foreground">
                  Please store required drinking water in clean covered containers. For emergency
                  water tanker requests, contact the operator directly.
                </p>
              </div>
            </div>
          </div>

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
                        <h4 className="text-body font-bold text-foreground">{item.zone}</h4>
                        <span className="text-caption text-muted-foreground">
                          Source: {item.source}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-2 rounded-xl bg-secondary/50 p-3 text-caption">
                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        <strong>Supply Timing:</strong> {item.timing}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>Frequency: {item.frequency}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      Operator: {item.operatorName}
                    </p>
                  </div>
                  <a
                    href={`tel:${item.operatorMobile}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-caption font-semibold text-primary-foreground hover:bg-primary-hover"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Operator</span>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
