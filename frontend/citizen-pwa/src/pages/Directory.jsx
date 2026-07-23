import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, UserRound, Clock, Phone, Mail, Landmark } from 'lucide-react';
import logo from '@/assets/logo.svg';
import { SafeImage } from '@/components/SafeImage';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { useVillageProfile } from '@/features/village/hooks';

// Leadership roles the Village Profile stores, in protocol order. Rendered only when the
// officer has filled a name in — so the directory grows as the profile is completed.
const ROLES = [
  'sarpanch',
  'deputySarpanch',
  'gramSevak',
  'talathi',
  'developmentOfficer',
  'policePatil',
];

/**
 * Public Gram Panchayat directory. Signed-out visitors can find who runs the village and how to
 * reach the office. Every value comes from the Village Profile `leadership` section, which an
 * officer edits from Admin → Village Profile — no code change to update the people or contacts.
 */
export function Directory() {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useVillageProfile();

  useEffect(() => {
    document.title = t('directory.title');
  }, [t]);

  const g = profile?.general ?? {};
  const lead = profile?.leadership ?? {};
  const members = ROLES.map((role) => ({ role, name: lead[role] })).filter((m) => m.name?.trim());
  const hasOffice = lead.officeTimings || lead.contactNumbers || lead.officeEmail;

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center gap-2.5 px-4 py-3">
          <SafeImage src={g.logo || logo} alt="" className="h-8 w-8 rounded" />
          <p className="truncate text-section text-foreground">{t('directory.title')}</p>
          <Link
            to="/welcome"
            className="ml-auto inline-flex items-center gap-1 text-caption font-medium text-primary hover:text-primary-hover"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t('directory.home')}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-title text-foreground">{t('directory.heading')}</h1>
        <p className="mt-1 text-body text-muted-foreground">{t('directory.intro')}</p>

        {isLoading ? (
          <p className="mt-6 text-body text-muted-foreground">{t('common.loading')}</p>
        ) : members.length === 0 && !hasOffice ? (
          <div className="mt-6">
            <EmptyState icon={UserRound} title={t('directory.empty')} />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {members.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {members.map((m) => (
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
        )}
      </main>
    </div>
  );
}
