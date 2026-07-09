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
    placeholderData: (prev) => prev,
  });
}

export function useNotice(id) {
  return useQuery({
    queryKey: noticeKeys.detail(id),
    queryFn: () => noticeService.getOne(id),
    enabled: Boolean(id),
  });
}
