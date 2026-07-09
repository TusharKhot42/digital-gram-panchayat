import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { SMS_SUMMARY_MAX_LENGTH } from '@dgp/shared';
import { Button } from '@/components/ui/button';

/** Broadcast composer: pick channel(s) + summary, with a cost-warning confirm. */
export function BroadcastDialog({ open, notice, onClose, onBroadcast, isPending }) {
  const { t } = useTranslation();
  const [sms, setSms] = useState(true);
  const [voice, setVoice] = useState(false);
  const [summary, setSummary] = useState(notice?.summary || '');

  if (!open) return null;

  const submit = async () => {
    if (!sms && !voice) {
      toast.error(t('notice.broadcast.pickChannel'));
      return;
    }
    if (!summary.trim()) {
      toast.error(t('notice.broadcast.summaryRequired'));
      return;
    }
    await onBroadcast({ sms, voice, summary: summary.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground">{t('notice.broadcast.title')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{notice?.title}</p>

        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} />
            {t('notice.broadcast.sms')}
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} />
            {t('notice.broadcast.voice')}
          </label>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-foreground">
            {t('notice.broadcast.summary')} ({summary.length}/{SMS_SUMMARY_MAX_LENGTH})
          </label>
          <textarea
            rows={3}
            maxLength={SMS_SUMMARY_MAX_LENGTH}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <p className="mt-3 rounded-md bg-orange-100 p-2 text-xs text-orange-800 dark:bg-orange-500/15 dark:text-orange-300">
          {t('notice.broadcast.costWarning')}
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('notice.dialog.cancel')}
          </Button>
          <Button size="sm" onClick={submit} disabled={isPending}>
            {isPending ? t('common.loading') : t('notice.broadcast.send')}
          </Button>
        </div>
      </div>
    </div>
  );
}
