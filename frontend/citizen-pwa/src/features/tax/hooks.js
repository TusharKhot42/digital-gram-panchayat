import { useQuery } from '@tanstack/react-query';
import { taxService } from './taxService';

export const taxKeys = {
  mine: (params) => ['tax', 'mine', params ?? {}],
};

export function useMyTax(params) {
  return useQuery({
    queryKey: taxKeys.mine(params),
    queryFn: () => taxService.mine(params),
    placeholderData: (prev) => prev,
  });
}
