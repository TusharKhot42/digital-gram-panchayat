import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taxService } from './taxService';

export const taxKeys = {
  list: (params) => ['admin-tax', 'list', params ?? {}],
  detail: (id) => ['admin-tax', 'detail', id],
};

export function useTaxRecords(params) {
  return useQuery({
    queryKey: taxKeys.list(params),
    queryFn: () => taxService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useTaxRecord(id) {
  return useQuery({
    queryKey: taxKeys.detail(id),
    queryFn: () => taxService.getOne(id),
    enabled: Boolean(id),
  });
}

export function useTaxMutations(id) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-tax', 'list'] });
    if (id) qc.invalidateQueries({ queryKey: taxKeys.detail(id) });
  };

  return {
    create: useMutation({
      mutationFn: (payload) => taxService.create(payload),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: (payload) => taxService.update(id, payload),
      onSuccess: invalidate,
    }),
    addPayment: useMutation({
      mutationFn: (payload) => taxService.addPayment(id, payload),
      onSuccess: invalidate,
    }),
  };
}
