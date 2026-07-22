import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { controlClass } from '@/components/ui/input';
import { SafeImage } from '@/components/SafeImage';
import { cn } from '@/utils/cn';
import { useVillage, useVillageMutation } from './hooks';

const GENERAL_FIELDS = [
  'villageName',
  'panchayatName',
  'taluka',
  'district',
  'state',
  'pinCode',
  'latitude',
  'longitude',
  'mapUrl',
];
const GENERAL_TEXTAREAS = ['description', 'history', 'vision', 'mission'];
const LEADERSHIP_FIELDS = [
  'sarpanch',
  'deputySarpanch',
  'gramSevak',
  'talathi',
  'developmentOfficer',
  'policePatil',
  'contactNumbers',
  'officeEmail',
  'officeTimings',
];
const SOCIAL_FIELDS = [
  'facebook',
  'instagram',
  'twitter',
  'youtube',
  'whatsapp',
  'telegram',
  'website',
];

function SectionCard({ title, children }) {
  return (
    <Card className="mb-4">
      <h2 className="border-b border-border px-5 py-3 text-section text-foreground">{title}</h2>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

function Labeled({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="block text-label text-foreground">{label}</span>
      {children}
    </label>
  );
}

/**
 * The single editor for the whole public Village Profile. Loads the current profile, lets an
 * officer edit each section, and saves everything in one PUT (the backend shallow-merges).
 * Awards / gallery / video management are handled in a later iteration — the model supports
 * them; this covers the re-branding essentials (identity, leadership, stats, contacts, social).
 */
export function VillageProfilePage() {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useVillage();
  const m = useVillageMutation();

  const [general, setGeneral] = useState({});
  const [leadership, setLeadership] = useState({});
  const [social, setSocial] = useState({});
  const [stats, setStats] = useState([]); // [{ key, value }]
  const [contacts, setContacts] = useState([]); // [{ label, phone }]
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (!profile) return;
    setGeneral(profile.general ?? {});
    setLeadership(profile.leadership ?? {});
    setSocial(profile.social ?? {});
    setStats(Object.entries(profile.statistics ?? {}).map(([key, value]) => ({ key, value })));
    setContacts(profile.emergencyContacts ?? []);
  }, [profile]);

  if (isLoading) return <p className="text-body text-muted-foreground">{t('common.loading')}</p>;

  const setG = (k, v) => setGeneral((p) => ({ ...p, [k]: v }));
  const setL = (k, v) => setLeadership((p) => ({ ...p, [k]: v }));
  const setS = (k, v) => setSocial((p) => ({ ...p, [k]: v }));

  const save = async () => {
    const statistics = Object.fromEntries(
      stats.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value]),
    );
    const emergencyContacts = contacts.filter((c) => c.label?.trim() || c.phone?.trim());
    try {
      await m.mutateAsync({
        sections: {
          general: {
            ...general,
            latitude: general.latitude ? Number(general.latitude) : undefined,
            longitude: general.longitude ? Number(general.longitude) : undefined,
          },
          leadership,
          social,
          statistics,
          emergencyContacts,
        },
        files: { logo, banner },
      });
      toast.success(t('village.saved'));
      setLogo(null);
      setBanner(null);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('village.saveFailed'));
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-title text-foreground">{t('village.title')}</h1>
      <p className="mb-4 text-body text-muted-foreground">{t('village.subtitle')}</p>

      <SectionCard title={t('village.general')}>
        <div className="grid gap-4 sm:grid-cols-2">
          {GENERAL_FIELDS.map((f) => (
            <Labeled key={f} label={t(`village.field.${f}`, f)}>
              <input
                className={controlClass}
                value={general[f] ?? ''}
                onChange={(e) => setG(f, e.target.value)}
              />
            </Labeled>
          ))}
        </div>
        {GENERAL_TEXTAREAS.map((f) => (
          <Labeled key={f} label={t(`village.field.${f}`, f)}>
            <textarea
              rows={2}
              className={cn(controlClass, 'mt-1 h-auto min-h-16 py-2.5')}
              value={general[f] ?? ''}
              onChange={(e) => setG(f, e.target.value)}
            />
          </Labeled>
        ))}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ['logo', logo, setLogo, profile?.general?.logo],
            ['banner', banner, setBanner, profile?.general?.banner],
          ].map(([key, file, setter, existing]) => (
            <div key={key} className="space-y-2">
              <span className="block text-label text-foreground">
                {t(`village.field.${key}`, key)}
              </span>
              {existing && !file ? (
                <SafeImage
                  src={existing}
                  alt=""
                  className="h-16 w-28 rounded-md border border-border object-cover"
                />
              ) : null}
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-3 py-2 text-sm text-muted-foreground">
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                {file ? file.name : t('village.choose')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setter(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t('village.statistics')}>
        <div className="space-y-2">
          {stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={controlClass}
                placeholder={t('village.statKey')}
                value={s.key}
                onChange={(e) =>
                  setStats((p) => p.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))
                }
              />
              <input
                className={controlClass}
                placeholder={t('village.statValue')}
                value={s.value ?? ''}
                onChange={(e) =>
                  setStats((p) => p.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('village.remove')}
                onClick={() => setStats((p) => p.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStats((p) => [...p, { key: '', value: '' }])}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('village.addStat')}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title={t('village.leadership')}>
        <div className="grid gap-4 sm:grid-cols-2">
          {LEADERSHIP_FIELDS.map((f) => (
            <Labeled key={f} label={t(`village.field.${f}`, f)}>
              <input
                className={controlClass}
                value={leadership[f] ?? ''}
                onChange={(e) => setL(f, e.target.value)}
              />
            </Labeled>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t('village.emergency')}>
        <div className="space-y-2">
          {contacts.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={controlClass}
                placeholder={t('village.contactLabel')}
                value={c.label ?? ''}
                onChange={(e) =>
                  setContacts((p) =>
                    p.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                  )
                }
              />
              <input
                className={controlClass}
                placeholder={t('village.contactPhone')}
                value={c.phone ?? ''}
                onChange={(e) =>
                  setContacts((p) =>
                    p.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)),
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('village.remove')}
                onClick={() => setContacts((p) => p.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setContacts((p) => [...p, { label: '', phone: '' }])}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('village.addContact')}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title={t('village.social')}>
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIAL_FIELDS.map((f) => (
            <Labeled key={f} label={t(`village.field.${f}`, f)}>
              <input
                className={controlClass}
                value={social[f] ?? ''}
                onChange={(e) => setS(f, e.target.value)}
              />
            </Labeled>
          ))}
        </div>
      </SectionCard>

      <div className="sticky bottom-0 -mx-1 border-t border-border bg-background/95 py-3 backdrop-blur">
        <Button onClick={save} loading={m.isPending}>
          {t('village.save')}
        </Button>
      </div>
    </div>
  );
}
