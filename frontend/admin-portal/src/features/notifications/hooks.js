import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from './notificationService';

export const notificationKeys = {
  list: (params) => ['admin-notifications', 'list', params ?? {}],
  detail: (id) => ['admin-notifications', 'detail', id],
  stats: () => ['admin-notifications', 'stats'],
};

export function useNotifications(params) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.list(params),
    placeholderData: (prev) => prev,
    refetchInterval: 30_000,
  });
}

export function useNotification(id) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationService.getOne(id),
    enabled: Boolean(id),
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => notificationService.stats(),
    refetchInterval: 30_000,
  });
}

export function useNotificationMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-notifications'] });
  return {
    broadcast: useMutation({
      mutationFn: (payload) => notificationService.broadcast(payload),
      onSuccess: invalidate,
    }),
    retry: useMutation({
      mutationFn: (id) => notificationService.retry(id),
      onSuccess: invalidate,
    }),
  };
}
