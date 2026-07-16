import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

/** Minimal modal confirm for irreversible actions (delete, broadcast). */
export function ConfirmDialog({ open, title, message, confirmLabel, danger, onConfirm, onCancel }) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      description={message}
      className="max-w-sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onCancel}>
            {t('notice.dialog.cancel')}
          </Button>
          <Button variant={danger ? 'destructive' : 'default'} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
