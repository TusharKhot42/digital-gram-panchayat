import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { complaintService } from './complaintService';

export const complaintKeys = {
  list: (params) => ['admin-complaints', 'list', params ?? {}],
  detail: (id) => ['admin-complaints', 'detail', id],
};

export function useComplaints(params) {
  return useQuery({
    queryKey: complaintKeys.list(params),
    queryFn: () => complaintService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useComplaint(id) {
  return useQuery({
    queryKey: complaintKeys.detail(id),
    queryFn: () => complaintService.getOne(id),
    enabled: Boolean(id),
  });
}

export function useUpdateComplaintStatus(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => complaintService.updateStatus(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData(complaintKeys.detail(id), updated);
      qc.invalidateQueries({ queryKey: ['admin-complaints', 'list'] });
    },
  });
}
