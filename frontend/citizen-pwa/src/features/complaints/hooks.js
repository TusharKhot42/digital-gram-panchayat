import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { complaintService } from './complaintService';

export const complaintKeys = {
  mine: (params) => ['complaints', 'mine', params ?? {}],
  detail: (id) => ['complaints', 'detail', id],
};

export function useMyComplaints(params) {
  return useQuery({
    queryKey: complaintKeys.mine(params),
    queryFn: () => complaintService.listMine(params),
  });
}

export function useComplaint(id) {
  return useQuery({
    queryKey: complaintKeys.detail(id),
    queryFn: () => complaintService.getOne(id),
    enabled: Boolean(id),
  });
}

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => complaintService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['complaints', 'mine'] });
    },
  });
}
