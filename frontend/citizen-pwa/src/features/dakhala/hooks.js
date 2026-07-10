import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { certificateService } from './certificateService';

export const dakhalaKeys = {
  mine: (params) => ['dakhala', 'mine', params ?? {}],
  detail: (id) => ['dakhala', 'detail', id],
};

export function useMyApplications(params) {
  return useQuery({
    queryKey: dakhalaKeys.mine(params),
    queryFn: () => certificateService.listMine(params),
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

export function useApplyCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => certificateService.apply(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dakhala', 'mine'] }),
  });
}
