import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noticeService } from './noticeService';

export const noticeKeys = {
  list: (params) => ['admin-notices', 'list', params ?? {}],
  detail: (id) => ['admin-notices', 'detail', id],
};

export function useNotices(params) {
  return useQuery({
    queryKey: noticeKeys.list(params),
    queryFn: () => noticeService.list(params),
    staleTime: 5 * 60_000, // reference data: rarely changes, avoid refetch on every nav
    placeholderData: (prev) => prev,
  });
}

export function useNotice(id) {
  return useQuery({
    queryKey: noticeKeys.detail(id),
    queryFn: () => noticeService.getOne(id),
    staleTime: 5 * 60_000, // reference data: rarely changes, avoid refetch on every nav
    enabled: Boolean(id),
  });
}

export function useNoticeMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-notices', 'list'] });

  return {
    create: useMutation({
      mutationFn: ({ values, file }) => noticeService.create(values, file),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, values, file }) => noticeService.update(id, values, file),
      onSuccess: invalidate,
    }),
    publish: useMutation({ mutationFn: (id) => noticeService.publish(id), onSuccess: invalidate }),
    archive: useMutation({ mutationFn: (id) => noticeService.archive(id), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id) => noticeService.remove(id), onSuccess: invalidate }),
    broadcast: useMutation({
      mutationFn: ({ id, payload }) => noticeService.broadcast(id, payload),
      onSuccess: invalidate,
    }),
  };
}
