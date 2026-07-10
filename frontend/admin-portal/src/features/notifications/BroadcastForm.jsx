import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { NOTIFICATION_TYPES } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { useNotificationMutations } from './hooks';

const CHANNELS = ['inApp', 'sms', 'voice', 'email'];

export function BroadcastForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const m = useNotificationMutations();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [targetRole, setTargetRole] = useState('citizen');
  const [channels, setChannels] = useState(['inApp']);

  const toggle = (ch) =>
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]));

  const submit = async (e) => {
    e.preventDefault();
    if (title.trim().length < 3 || message.trim().length < 3) {
      toast.error(t('ntf.form.required'));
      return;
    }
    if (channels.length === 0) {
      toast.error(t('ntf.form.pickChannel'));
      return;
    }
    try {
      const res = await m.broadcast.mutateAsync({
        title: title.trim(),
        message: message.trim(),
        type,
        targetRole,
        channels,
      });
      toast.success(t('ntf.form.sent', { count: res.recipientCount }));
      navigate('/notifications', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('ntf.form.failed'));
    }
  };

  const input =
    'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className="max-w-xl">
      <Link
        to="/notifications"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('ntf.back')}
      </Link>
      <h1 className="mb-4 text-lg font-semibold text-foreground">{t('ntf.form.title')}</h1>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('ntf.form.subject')}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={160}
            className={input}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('ntf.form.message')}
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              {t('ntf.form.type')}
            </label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={input}>
              {NOTIFICATION_TYPES.map((ty) => (
                <option key={ty} value={ty}>
                  {t(`ntf.type.${ty}`, ty)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              {t('ntf.form.target')}
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className={input}
            >
              <option value="citizen">{t('ntf.form.citizens')}</option>
              <option value="officer">{t('ntf.form.officers')}</option>
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">
            {t('ntf.form.channels')}
          </label>
          <div className="flex flex-wrap gap-3">
            {CHANNELS.map((ch) => (
              <label key={ch} className="flex items-center gap-1 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={channels.includes(ch)}
                  onChange={() => toggle(ch)}
                />
                {ch}
              </label>
            ))}
          </div>
        </div>

        <p className="rounded-md bg-orange-100 p-2 text-xs text-orange-800 dark:bg-orange-500/15 dark:text-orange-300">
          {t('ntf.form.costWarning')}
        </p>

        <Button type="submit" disabled={m.broadcast.isPending}>
          {m.broadcast.isPending ? t('common.loading') : t('ntf.form.send')}
        </Button>
      </form>
    </div>
  );
}
