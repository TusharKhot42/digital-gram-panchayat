import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Phone, Copy, Search, User, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SafeImage } from '@/components/SafeImage';
import { sortMembers } from '@/features/village/members';

function initials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?'
  );
}

export function MemberContactsSection({ members = [] }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');

  const sorted = sortMembers(members);
  const filteredMembers = sorted.filter((m) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.designation && m.designation.toLowerCase().includes(q)) ||
      (m.ward && String(m.ward).toLowerCase().includes(q))
    );
  });

  const handleCopy = async (number, name) => {
    try {
      await navigator.clipboard.writeText(number);
      toast.success(t('members.copied', { name, number }));
    } catch {
      toast.error(t('members.copyFailed'));
    }
  };

  return (
    <section aria-labelledby="member-contacts-heading" className="space-y-4">
      {/* Section Header with Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-background p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-caption font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('members.badge')}</span>
            </div>
            <h2
              id="member-contacts-heading"
              className="text-section font-bold tracking-tight text-foreground"
            >
              {t('members.title')}
            </h2>
            <p className="text-caption text-muted-foreground">{t('members.subtitle')}</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('members.searchPlaceholder')}
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-caption text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Member Cards Grid */}
      {filteredMembers.length === 0 ? (
        <Card className="p-6 text-center">
          <User className="mx-auto h-8 w-8 text-muted-foreground opacity-60" />
          <p className="mt-2 text-caption text-muted-foreground">{t('members.noMembers')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((m) => (
            <Card
              key={m.id || m.name}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                {m.photo ? (
                  <SafeImage
                    src={m.photo}
                    alt={m.name}
                    className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {initials(m.name)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-body font-semibold text-foreground">{m.name}</h3>
                  <p className="truncate text-caption font-medium text-primary">
                    {m.designation || t('members.defaultDesignation')}
                  </p>
                  {m.ward ? (
                    <span className="mt-0.5 inline-block text-caption text-muted-foreground">
                      {t('members.ward')}: {m.ward}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Contact Actions */}
              <div className="mt-4 pt-3 border-t border-border/60">
                {m.mobile ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${m.mobile}`}
                      aria-label={t('members.callAria', { name: m.name, number: m.mobile })}
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-caption font-semibold text-primary-foreground shadow-2xs transition-all duration-150 hover:bg-primary-hover active:scale-[0.98]"
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      <span>{m.mobile}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(m.mobile, m.name)}
                      aria-label={t('members.copyAria', { name: m.name })}
                      className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-[0.98]"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <p className="text-caption text-muted-foreground italic text-center">
                    {t('members.noMobile')}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
