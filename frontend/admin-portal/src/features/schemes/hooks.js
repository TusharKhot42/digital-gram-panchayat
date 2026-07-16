import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schemeService } from './schemeService';

export const schemeKeys = {
  list: (params) => ['admin-schemes', 'list', params ?? {}],
  detail: (id) => ['admin-schemes', 'detail', id],
};

export function useSchemes(params) {
  return useQuery({
    queryKey: schemeKeys.list(params),
    queryFn: () => schemeService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useScheme(id) {
  return useQuery({
    queryKey: schemeKeys.detail(id),
    queryFn: () => schemeService.getOne(id),
    enabled: Boolean(id),
  });
}

export function useSchemeMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-schemes', 'list'] });

  return {
    create: useMutation({
      mutationFn: ({ values, files }) => schemeService.create(values, files),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, values, files }) => schemeService.update(id, values, files),
      onSuccess: invalidate,
    }),
    publish: useMutation({ mutationFn: (id) => schemeService.publish(id), onSuccess: invalidate }),
    unpublish: useMutation({
      mutationFn: (id) => schemeService.unpublish(id),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: (id) => schemeService.remove(id), onSuccess: invalidate }),
  };
}
