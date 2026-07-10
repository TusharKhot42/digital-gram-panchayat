import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { certificateService } from './certificateService';

export const dakhalaKeys = {
  list: (params) => ['admin-dakhala', 'list', params ?? {}],
  detail: (id) => ['admin-dakhala', 'detail', id],
};

export function useApplications(params) {
  return useQuery({
    queryKey: dakhalaKeys.list(params),
    queryFn: () => certificateService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useApplication(id) {
  return useQuery({
    queryKey: dakhalaKeys.detail(id),
    queryFn: () => certificateService.getOne(id),
    enabled: Boolean(id),
  });
}

export function useReviewMutations(id) {
  const qc = useQueryClient();
  const onSuccess = (updated) => {
    qc.setQueryData(dakhalaKeys.detail(id), updated);
    qc.invalidateQueries({ queryKey: ['admin-dakhala', 'list'] });
  };
  return {
    approve: useMutation({ mutationFn: () => certificateService.approve(id), onSuccess }),
    reject: useMutation({
      mutationFn: (reason) => certificateService.reject(id, reason),
      onSuccess,
    }),
  };
}
