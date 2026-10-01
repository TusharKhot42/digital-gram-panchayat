import { useQuery } from '@tanstack/react-query';
import { timetableService } from './timetableService';

export function useTimetable() {
  return useQuery({
    queryKey: ['timetable'],
    queryFn: () => timetableService.get(),
    staleTime: 60_000,
  });
}
