import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { complaintService } from '@/features/complaints/complaintService';
import { getQueuedComplaints, removeQueued } from '@/services/offline-queue';

/**
 * Drains the offline complaint queue whenever the app regains connectivity (and once on
 * mount, in case complaints were queued in a previous session). Each queued item replays
 * with its stored Idempotency-Key, so a complaint delivered but not yet dequeued (e.g. the
 * tab closed mid-sync) is de-duplicated by the backend rather than created twice.
 */
export function useOfflineComplaintSync() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const draining = useRef(false);

  const drain = useCallback(async () => {
    if (draining.current || !navigator.onLine) return;
    draining.current = true;
    try {
      const queued = await getQueuedComplaints();
      let delivered = 0;
      // Deliver sequentially, in submission order, so complaints arrive as filed.
      for (const item of queued) {
        try {
          await complaintService.create(item.payload, item.idempotencyKey);
          await removeQueued(item.id);
          delivered += 1;
        } catch (err) {
          if (err.response) {
            // Server responded (delivered or permanently rejected) — drop it so a bad
            // record can't jam the queue forever.
            await removeQueued(item.id);
            delivered += 1;
          } else {
            break; // network dropped again — keep the rest for the next reconnect
          }
        }
      }
      if (delivered > 0) {
        toast.success(t('pwa.syncedComplaints', { count: delivered }));
        qc.invalidateQueries({ queryKey: ['complaints', 'mine'] });
      }
    } finally {
      draining.current = false;
    }
  }, [qc, t]);

  useEffect(() => {
    void drain();
    window.addEventListener('online', drain);
    return () => window.removeEventListener('online', drain);
  }, [drain]);
}
