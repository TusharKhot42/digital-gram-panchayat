import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

/** Reject dialog — reason is mandatory (min 3 chars). */
export function RejectDialog({ open, application, isPending, onReject, onClose }) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  if (!open) return null;

  const submit = () => {
    if (reason.trim().length < 3) return;
    onReject(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground">
          {t('dakhala.review.rejectTitle')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{application?.applicationId}</p>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('dakhala.review.reasonPlaceholder')}
          className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('dakhala.review.cancel')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={submit}
            disabled={isPending || reason.trim().length < 3}
          >
            {isPending ? t('common.loading') : t('dakhala.review.confirmReject')}
          </Button>
        </div>
      </div>
    </div>
  );
}
