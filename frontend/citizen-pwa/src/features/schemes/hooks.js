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
    staleTime: 5 * 60_000, // reference data: rarely changes, avoid refetch on every nav
    placeholderData: (prev) => prev,
  });
}

export function useScheme(id) {
  return useQuery({
    queryKey: schemeKeys.detail(id),
    queryFn: () => schemeService.getOne(id),
    staleTime: 5 * 60_000, // reference data: rarely changes, avoid refetch on every nav
    enabled: Boolean(id),
  });
}
