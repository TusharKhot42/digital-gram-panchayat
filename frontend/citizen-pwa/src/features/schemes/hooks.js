import { useQuery } from '@tanstack/react-query';
import { schemeService } from './schemeService';

export const schemeKeys = {
  list: (params) => ['schemes', 'list', params ?? {}],
  detail: (id) => ['schemes', 'detail', id],
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
