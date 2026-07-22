import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { villageService, eventService } from './villageService';

export function useVillage() {
  return useQuery({ queryKey: ['admin', 'village'], queryFn: () => villageService.get() });
}

export function useVillageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sections, files }) => villageService.update(sections, files),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'village'] }),
  });
}

export function useEvents(params) {
  return useQuery({
    queryKey: ['admin', 'events', params ?? {}],
    queryFn: () => eventService.list(params),
  });
}

export function useEventMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'events'] });
  return {
    create: useMutation({
      mutationFn: ({ values, file }) => eventService.create(values, file),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: (id) => eventService.remove(id), onSuccess: invalidate }),
  };
}
