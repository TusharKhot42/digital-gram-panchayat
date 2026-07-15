import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { SMS_SUMMARY_MAX_LENGTH } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/input';

/** Broadcast composer: pick channel(s) + summary, with a cost-warning confirm. */
export function BroadcastDialog({ open, notice, onClose, onBroadcast, isPending }) {
  const { t } = useTranslation();
  const [sms, setSms] = useState(true);
  const [voice, setVoice] = useState(false);
  const [summary, setSummary] = useState(notice?.summary || '');

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

  const remaining = SMS_SUMMARY_MAX_LENGTH - summary.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('notice.broadcast.title')}
      description={notice?.title}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('notice.dialog.cancel')}
          </Button>
          <Button size="sm" onClick={submit} loading={isPending}>
            {t('notice.broadcast.send')}
          </Button>
        </>
      }
    >
      <fieldset className="space-y-2">
        <legend className="sr-only">{t('notice.broadcast.title')}</legend>
        <label className="flex min-h-9 items-center gap-2 text-body text-foreground">
          <input
            type="checkbox"
            checked={sms}
            onChange={(e) => setSms(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          {t('notice.broadcast.sms')}
        </label>
        <label className="flex min-h-9 items-center gap-2 text-body text-foreground">
          <input
            type="checkbox"
            checked={voice}
            onChange={(e) => setVoice(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          {t('notice.broadcast.voice')}
        </label>
      </fieldset>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="broadcast-summary" className="block text-label text-foreground">
            {t('notice.broadcast.summary')}
          </label>
          <span
            className={`text-caption tabular-nums ${
              remaining <= 20 ? 'text-warning-strong' : 'text-muted-foreground'
            }`}
          >
            {summary.length}/{SMS_SUMMARY_MAX_LENGTH}
          </span>
        </div>
        <Textarea
          id="broadcast-summary"
          rows={3}
          maxLength={SMS_SUMMARY_MAX_LENGTH}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      {/* Broadcasting spends real money per recipient — say so before the button is pressed. */}
      <p className="mt-3 flex items-start gap-1.5 rounded-md bg-warning-subtle p-2.5 text-caption text-warning-strong ring-1 ring-inset ring-warning/30">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {t('notice.broadcast.costWarning')}
      </p>
    </Dialog>
  );
}
