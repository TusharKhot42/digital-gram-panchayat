import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { NOTIFICATION_TYPES } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { controlClass } from '@/components/ui/input';
import { cn } from '@/utils/cn';
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

  return (
    <div className="max-w-xl">
      <Link
        to="/notifications"
        className="mb-3 -ml-1 inline-flex min-h-9 items-center gap-1 rounded-md px-1 text-body text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('ntf.back')}
      </Link>
      <h1 className="mb-4 text-title text-foreground">{t('ntf.form.title')}</h1>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="broadcast-subject" className="block text-label text-foreground">
            {t('ntf.form.subject')}
          </label>
          <input
            id="broadcast-subject"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={160}
            className={controlClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="broadcast-message" className="block text-label text-foreground">
            {t('ntf.form.message')}
          </label>
          <textarea
            id="broadcast-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            className={cn(controlClass, 'h-auto min-h-24 py-2.5')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="broadcast-type" className="block text-label text-foreground">
              {t('ntf.form.type')}
            </label>
            <select
              id="broadcast-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={controlClass}
            >
              {NOTIFICATION_TYPES.map((ty) => (
                <option key={ty} value={ty}>
                  {t(`ntf.type.${ty}`, ty)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="broadcast-target" className="block text-label text-foreground">
              {t('ntf.form.target')}
            </label>
            <select
              id="broadcast-target"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className={controlClass}
            >
              <option value="citizen">{t('ntf.form.citizens')}</option>
              <option value="officer">{t('ntf.form.officers')}</option>
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-label text-foreground">{t('ntf.form.channels')}</label>
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

        <p className="rounded-md bg-warning-subtle p-2 text-caption text-warning-strong ring-1 ring-inset ring-warning/30">
          {t('ntf.form.costWarning')}
        </p>

        <Button type="submit" disabled={m.broadcast.isPending}>
          {m.broadcast.isPending ? t('common.loading') : t('ntf.form.send')}
        </Button>
      </form>
    </div>
  );
}
