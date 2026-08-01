import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, UserRound, Clock, Phone, Mail, Landmark, Search } from 'lucide-react';
import { MEMBER_CATEGORIES } from '@dgp/shared';
import logo from '@/assets/logo.svg';
import { SafeImage } from '@/components/SafeImage';
import { Card, CardContent } from '@/components/ui/card';
import { controlClass } from '@/components/ui/input';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/utils/cn';
import { useVillageProfile } from '@/features/village/hooks';
import { sortMembers, tenureInfo } from '@/features/village/members';
import { OfficialCard } from '@/features/village/OfficialCard';

// Flat leadership roles kept for backward compatibility — shown only when no rich members exist.
const LEGACY_ROLES = [
  'sarpanch',
  'deputySarpanch',
  'gramSevak',
  'talathi',
  'developmentOfficer',
  'policePatil',
];

export function Directory() {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useVillageProfile();

  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [designation, setDesignation] = useState('all');
  const [ward, setWard] = useState('all');
  const [sort, setSort] = useState('priority');

  useEffect(() => {
    document.title = t('directory.title');
  }, [t]);

  const g = profile?.general ?? {};
  const lead = profile?.leadership ?? {};
  const allMembers = useMemo(() => profile?.members ?? [], [profile]);

  const designations = useMemo(
    () => [...new Set(allMembers.map((m) => m.designation).filter(Boolean))].sort(),
    [allMembers],
  );
  const wards = useMemo(
    () => [...new Set(allMembers.map((m) => m.ward).filter(Boolean))].sort(),
    [allMembers],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = allMembers.filter((m) => {
      if (category !== 'all' && m.category !== category) return false;
      if (designation !== 'all' && m.designation !== designation) return false;
      if (ward !== 'all' && m.ward !== ward) return false;
      if (needle) {
        const hay = `${m.name || ''} ${m.designation || ''} ${m.ward || ''}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    if (sort === 'name') {
      list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sort === 'tenure') {
      list = [...list].sort(
        (a, b) => (tenureInfo(b).yearsServed ?? 0) - (tenureInfo(a).yearsServed ?? 0),
      );
    } else {
      list = sortMembers(list);
    }
    return list;
  }, [allMembers, q, category, designation, ward, sort]);

  const hasMembers = allMembers.length > 0;
  const legacy = LEGACY_ROLES.map((role) => ({ role, name: lead[role] })).filter((m) =>
    m.name?.trim(),
  );
  const hasOffice = lead.officeTimings || lead.contactNumbers || lead.officeEmail;

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-3">
          <SafeImage src={g.logo || logo} alt="" className="h-8 w-8 rounded" />
          <p className="truncate text-section text-foreground">{t('directory.title')}</p>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1 text-caption font-medium text-primary hover:text-primary-hover"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t('directory.home')}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-title text-foreground">{t('directory.heading')}</h1>
        <p className="mt-1 text-body text-muted-foreground">{t('directory.intro')}</p>

        {isLoading ? (
          <p className="mt-6 text-body text-muted-foreground">{t('common.loading')}</p>
        ) : hasMembers ? (
          <>
            {/* Controls */}
            <div className="mt-6 space-y-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <label htmlFor="dir-search" className="sr-only">
                  {t('directory.search')}
                </label>
                <input
                  id="dir-search"
                  className={cn(controlClass, 'pl-9')}
                  placeholder={t('directory.searchPlaceholder')}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              {/* Category chips */}
              <div className="flex flex-wrap gap-2">
                <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
                  {t('directory.allCategories')}
                </FilterChip>
                {MEMBER_CATEGORIES.map((c) => (
                  <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                    {t(`directory.category.${c}`, c)}
                  </FilterChip>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <select
                  className={controlClass}
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  aria-label={t('directory.filterDesignation')}
                >
                  <option value="all">{t('directory.allDesignations')}</option>
                  {designations.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  className={controlClass}
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  aria-label={t('directory.filterWard')}
                >
                  <option value="all">{t('directory.allWards')}</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>
                      {t('directory.ward')} {w}
                    </option>
                  ))}
                </select>
                <select
                  className={controlClass}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label={t('directory.sort')}
                >
                  <option value="priority">{t('directory.sortPriority')}</option>
                  <option value="name">{t('directory.sortName')}</option>
                  <option value="tenure">{t('directory.sortTenure')}</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {filtered.length ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* min-w-0 on each cell: a grid item's default `min-width: auto` sizes the
                    column to the card's longest unbreakable content (a full office address or
                    email), which pushed the page 68px wide at 320px once real members existed. */}
                {filtered.map((m) => (
                  <li key={m.id} className="min-w-0">
                    <OfficialCard member={m} variant="full" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6">
                <EmptyState icon={Search} title={t('directory.noMatch')} />
              </div>
            )}
          </>
        ) : legacy.length || hasOffice ? (
          // Backward-compatible view when only the flat leadership section is filled in.
          <div className="mt-6 space-y-6">
            {legacy.length ? (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {legacy.map((m) => (
                  <li key={m.role}>
                    <Card className="flex h-full items-center gap-3 p-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
                        <UserRound className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-body font-semibold text-foreground">{m.name}</p>
                        <p className="truncate text-caption text-muted-foreground">
                          {t(`directory.role.${m.role}`)}
                        </p>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            ) : null}
            {hasOffice ? (
              <Card>
                <h2 className="flex items-center gap-2 border-b border-border px-5 py-3 text-section text-foreground">
                  <Landmark className="h-4 w-4 text-primary" aria-hidden="true" />
                  {t('directory.office')}
                </h2>
                <CardContent className="space-y-2 p-5">
                  {lead.officeTimings ? (
                    <p className="flex items-center gap-2 text-body text-foreground">
                      <Clock
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      {lead.officeTimings}
                    </p>
                  ) : null}
                  {lead.contactNumbers ? (
                    <p className="flex items-center gap-2 text-body text-foreground">
                      <Phone
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <a href={`tel:${lead.contactNumbers}`} className="hover:text-primary">
                        {lead.contactNumbers}
                      </a>
                    </p>
                  ) : null}
                  {lead.officeEmail ? (
                    <p className="flex items-center gap-2 text-body text-foreground">
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <a href={`mailto:${lead.officeEmail}`} className="hover:text-primary">
                        {lead.officeEmail}
                      </a>
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState icon={UserRound} title={t('directory.willUpdate')} />
          </div>
        )}
      </main>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        // min-h-9 keeps the chip clear of the 24px WCAG 2.5.8 target minimum with room to spare.
        'inline-flex min-h-9 items-center rounded-full border px-3.5 text-caption font-medium transition-colors duration-150',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:bg-accent',
      )}
    >
      {children}
    </button>
  );
}
