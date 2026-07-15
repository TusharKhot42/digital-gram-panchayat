import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/input';

const MIN_REASON = 3;

/** Reject dialog — reason is mandatory (min 3 chars). */
export function RejectDialog({ open, application, isPending, onReject, onClose }) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  const tooShort = reason.trim().length < MIN_REASON;

  const submit = () => {
    if (tooShort) return;
    onReject(reason.trim());
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('dakhala.review.rejectTitle')}
      description={application?.applicationId}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('dakhala.review.cancel')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={submit}
            loading={isPending}
            disabled={tooShort}
          >
            {t('dakhala.review.confirmReject')}
          </Button>
        </>
      }
    >
      {/* The citizen reads this reason verbatim, so it can't be blank. */}
      <Textarea
        rows={4}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={t('dakhala.review.reasonPlaceholder')}
        aria-label={t('dakhala.review.rejectTitle')}
        autoFocus
      />
    </Dialog>
  );
}
