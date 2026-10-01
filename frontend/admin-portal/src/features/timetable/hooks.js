import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { timetableService } from './timetableService';

export const timetableKeys = {
  all: ['admin', 'timetable'],
};

export function useAdminTimetable() {
  return useQuery({
    queryKey: timetableKeys.all,
    queryFn: () => timetableService.get(),
  });
}

export function useTimetableMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: timetableKeys.all });

  return {
    update: useMutation({
      mutationFn: (payload) => timetableService.update(payload),
      onSuccess: invalidate,
    }),
    reset: useMutation({
      mutationFn: () => timetableService.reset(),
      onSuccess: invalidate,
    }),
  };
}
