import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { PageHeader } from '@/components/PageHeader';
import { useUser, useSetUserStatus } from './hooks';

export function UserProfile() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: u, isLoading, isError } = useUser(id);
  const setStatus = useSetUserStatus(id);
  const [confirm, setConfirm] = useState(false);

  if (isLoading) return <p className="text-body text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !u)
    return <p className="text-body text-destructive-strong">{t('users.notFound')}</p>;

  const toggle = async () => {
    try {
      await setStatus.mutateAsync({ id: u.id, status: u.isActive ? 'inactive' : 'active' });
      toast.success(u.isActive ? t('users.deactivated') : t('users.activated'));
      setConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('users.actionFailed'));
    }
  };

  const rows = [
    [t('users.mobile'), u.mobile],
    [t('users.email'), u.email],
    [t('users.village'), u.village],
    [t('users.address'), u.address],
    [t('users.joined'), formatDate(u.createdAt, locale)],
  ];

  return (
    <div className="max-w-xl">
      <PageHeader backTo="/users" backLabel={t('users.back')} title={t('users.title')} />

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
              <UserCircle className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-title text-foreground">{u.fullName}</h2>
              <Chip color={u.isActive ? 'green' : 'grey'} className="mt-1">
                {u.isActive ? t('users.active') : t('users.inactive')}
              </Chip>
            </div>
          </div>

          <dl className="divide-y divide-border border-y border-border">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 py-2.5">
                <dt className="text-body text-muted-foreground">{label}</dt>
                <dd className="text-right text-body font-medium text-foreground">{value || '—'}</dd>
              </div>
            ))}
          </dl>

          {/* Deactivation locks a citizen out, so it asks first rather than firing on one click. */}
          <div className="mt-5">
            {confirm ? (
              <div className="space-y-2.5">
                <p className="text-body text-muted-foreground">
                  {u.isActive ? t('users.confirmDeactivate') : t('users.confirmActivate')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={u.isActive ? 'destructive' : 'default'}
                    size="sm"
                    onClick={toggle}
                    loading={setStatus.isPending}
                  >
                    {t('users.confirm')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirm(false)}>
                    {t('users.cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant={u.isActive ? 'destructive' : 'default'}
                size="sm"
                onClick={() => setConfirm(true)}
              >
                {u.isActive ? t('users.deactivate') : t('users.activate')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
