import { useOfflineComplaintSync } from '@/hooks/useOfflineComplaintSync';

/**
 * Headless mount point for the offline complaint sync. Lives inside the authenticated app
 * shell so queued complaints are delivered as soon as connectivity returns.
 */
export function BackgroundSync() {
  useOfflineComplaintSync();
  return null;
}
