import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, CalendarDays, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, EVENT_CATEGORIES } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { controlClass } from '@/components/ui/input';
import { SafeImage } from '@/components/SafeImage';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/features/schemes/ConfirmDialog';
import { useEvents, useEventMutations } from './hooks';

export function EventsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data } = useEvents();
  const m = useEventMutations();

  const [form, setForm] = useState({
    title: '',
    startDate: '',
    location: '',
    organizer: '',
    category: 'Other',
  });
  const [file, setFile] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const events = data?.data ?? [];
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.startDate) {
      toast.error(t('events.required'));
      return;
    }
    try {
      await m.create.mutateAsync({ values: form, file });
      toast.success(t('events.created'));
      setForm({ title: '', startDate: '', location: '', organizer: '', category: 'Other' });
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('events.failed'));
    }
  };

  const confirmDelete = async () => {
    try {
      await m.remove.mutateAsync(toDelete.id);
      toast.success(t('events.deleted'));
    } catch {
      toast.error(t('events.failed'));
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-title text-foreground">{t('events.title')}</h1>
      <p className="mb-4 text-body text-muted-foreground">{t('events.subtitle')}</p>

      <Card className="mb-6">
        <h2 className="border-b border-border px-5 py-3 text-section text-foreground">
          {t('events.add')}
        </h2>
        <CardContent className="p-5">
          <form onSubmit={create} className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 sm:col-span-2">
              <span className="block text-label text-foreground">{t('events.field.title')}</span>
              <input
                className={controlClass}
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <span className="block text-label text-foreground">
                {t('events.field.startDate')}
              </span>
              <input
                type="date"
                className={controlClass}
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <span className="block text-label text-foreground">{t('events.field.category')}</span>
              <select
                className={controlClass}
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`events.category.${c}`, c)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="block text-label text-foreground">{t('events.field.location')}</span>
              <input
                className={controlClass}
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <span className="block text-label text-foreground">
                {t('events.field.organizer')}
              </span>
              <input
                className={controlClass}
                value={form.organizer}
                onChange={(e) => set('organizer', e.target.value)}
              />
            </label>
            <div className="space-y-1 sm:col-span-2">
              <span className="block text-label text-foreground">{t('events.field.banner')}</span>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-3 py-2 text-sm text-muted-foreground">
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                {file ? file.name : t('events.chooseBanner')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" loading={m.create.isPending}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t('events.add')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {events.length === 0 ? (
        <EmptyState icon={CalendarDays} title={t('events.empty')} />
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id}>
              <Card className="flex items-center gap-3 p-3">
                {e.banner ? (
                  <SafeImage
                    src={e.banner}
                    alt=""
                    className="h-12 w-16 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded bg-primary-subtle text-primary">
                    <CalendarDays className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-medium text-foreground">{e.title}</p>
                  <p className="truncate text-caption text-muted-foreground">
                    {formatDate(e.startDate, locale)}
                    {e.location ? ` · ${e.location}` : ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('events.delete')}
                  onClick={() => setToDelete(e)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={t('events.deleteTitle')}
        message={t('events.deleteBody', { title: toDelete?.title })}
        confirmLabel={t('events.delete')}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
