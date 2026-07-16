import { useQuery } from '@tanstack/react-query';
import { reportService } from './reportService';

export function useReport() {
  return useQuery({
    queryKey: ['dashboard', 'report'],
    queryFn: reportService.get,
    staleTime: 60_000,
  });
}
