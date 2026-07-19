import { useQuery } from '@tanstack/react-query';
import { noticeService } from './noticeService';

export const noticeKeys = {
  list: (params) => ['notices', 'list', params ?? {}],
  detail: (id) => ['notices', 'detail', id],
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
