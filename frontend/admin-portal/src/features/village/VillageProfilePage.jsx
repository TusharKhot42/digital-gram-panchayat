import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { MEMBER_STATUSES, MEMBER_CATEGORIES } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { controlClass } from '@/components/ui/input';
import { SafeImage } from '@/components/SafeImage';
import { cn } from '@/utils/cn';
import { useVillage, useVillageMutation } from './hooks';

// Text fields for each directory member (status/category are selects, handled separately).
const MEMBER_TEXT_FIELDS = [
  'name',
  'designation',
  'ward',
  'mobile',
  'officePhone',
  'email',
  'officeHours',
  'officeAddress',
  'photo',
  'termStart',
  'termEnd',
];
const MEMBER_DATE_FIELDS = new Set(['termStart', 'termEnd']);
const emptyMember = () => ({ status: 'Active', category: 'OfficeBearer', order: 0 });

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
  const [members, setMembers] = useState([]); // directory members
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (!profile) return;
    setGeneral(profile.general ?? {});
    setLeadership(profile.leadership ?? {});
    setSocial(profile.social ?? {});
    setStats(Object.entries(profile.statistics ?? {}).map(([key, value]) => ({ key, value })));
    setContacts(profile.emergencyContacts ?? []);
    setMembers(
      (profile.members ?? []).map((m) => ({
        ...m,
        termStart: m.termStart ? String(m.termStart).slice(0, 10) : '',
        termEnd: m.termEnd ? String(m.termEnd).slice(0, 10) : '',
      })),
    );
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
    // Keep only members with a name; blank date strings become undefined so Mongoose skips them.
    const cleanMembers = members
      .filter((mem) => mem.name?.trim())
      .map((mem) => ({
        ...mem,
        order: Number(mem.order) || 0,
        termStart: mem.termStart || undefined,
        termEnd: mem.termEnd || undefined,
      }));
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
          members: cleanMembers,
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
                aria-label={t('village.statKey')}
                value={s.key}
                onChange={(e) =>
                  setStats((p) => p.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))
                }
              />
              <input
                className={controlClass}
                placeholder={t('village.statValue')}
                aria-label={t('village.statValue')}
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
                aria-label={t('village.contactLabel')}
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
                aria-label={t('village.contactPhone')}
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

      <SectionCard title={t('village.members')}>
        <div className="space-y-4">
          {members.map((mem, i) => {
            const setMember = (k, v) =>
              setMembers((p) => p.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
            return (
              <div key={i} className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-label text-foreground">
                    {mem.name?.trim() || t('village.member')} {`#${i + 1}`}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t('village.remove')}
                    onClick={() => setMembers((p) => p.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {MEMBER_TEXT_FIELDS.map((f) => (
                    <Labeled key={f} label={t(`village.memberField.${f}`, f)}>
                      <input
                        type={MEMBER_DATE_FIELDS.has(f) ? 'date' : 'text'}
                        className={controlClass}
                        value={mem[f] ?? ''}
                        onChange={(e) => setMember(f, e.target.value)}
                      />
                    </Labeled>
                  ))}
                  <Labeled label={t('village.memberField.category')}>
                    <select
                      className={controlClass}
                      value={mem.category ?? 'OfficeBearer'}
                      onChange={(e) => setMember('category', e.target.value)}
                    >
                      {MEMBER_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {t(`directory.category.${c}`, c)}
                        </option>
                      ))}
                    </select>
                  </Labeled>
                  <Labeled label={t('village.memberField.status')}>
                    <select
                      className={controlClass}
                      value={mem.status ?? 'Active'}
                      onChange={(e) => setMember('status', e.target.value)}
                    >
                      {MEMBER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(`directory.status.${s}`, s)}
                        </option>
                      ))}
                    </select>
                  </Labeled>
                  <Labeled label={t('village.memberField.order')}>
                    <input
                      type="number"
                      className={controlClass}
                      value={mem.order ?? 0}
                      onChange={(e) => setMember('order', e.target.value)}
                    />
                  </Labeled>
                </div>
                <Labeled label={t('village.memberField.responsibilities')}>
                  <textarea
                    rows={2}
                    className={cn(controlClass, 'mt-1 h-auto min-h-16 py-2.5')}
                    value={mem.responsibilities ?? ''}
                    onChange={(e) => setMember('responsibilities', e.target.value)}
                  />
                </Labeled>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMembers((p) => [...p, emptyMember()])}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('village.addMember')}
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
