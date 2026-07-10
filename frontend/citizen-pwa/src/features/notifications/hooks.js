import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from './notificationService';

export const notificationKeys = {
  list: (params) => ['notifications', 'list', params ?? {}],
  detail: (id) => ['notifications', 'detail', id],
  unread: () => ['notifications', 'unread'],
};

export function useNotifications(params) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useNotification(id) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationService.getOne(id),
    enabled: Boolean(id),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: 30_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
