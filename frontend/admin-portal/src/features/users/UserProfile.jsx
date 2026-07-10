import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { useUser, useSetUserStatus } from './hooks';

export function UserProfile() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: u, isLoading, isError } = useUser(id);
  const setStatus = useSetUserStatus(id);
  const [confirm, setConfirm] = useState(false);

  if (isLoading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !u) return <p className="text-sm text-destructive">{t('users.notFound')}</p>;

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
      <Link
        to="/users"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('users.back')}
      </Link>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserCircle className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{u.fullName}</h1>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'}`}
            >
              {u.isActive ? t('users.active') : t('users.inactive')}
            </span>
          </div>
        </div>

        <dl className="space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium text-foreground">{value || '—'}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 border-t border-border pt-4">
          {confirm ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {u.isActive ? t('users.confirmDeactivate') : t('users.confirmActivate')}
              </p>
              <div className="flex gap-2">
                <Button
                  variant={u.isActive ? 'destructive' : 'default'}
                  size="sm"
                  onClick={toggle}
                  disabled={setStatus.isPending}
                >
                  {setStatus.isPending ? t('common.loading') : t('users.confirm')}
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
      </div>
    </div>
  );
}
