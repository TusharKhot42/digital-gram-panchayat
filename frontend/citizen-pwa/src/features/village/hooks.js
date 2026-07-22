import { useQuery } from '@tanstack/react-query';
import { villageService } from './villageService';

// The village profile is edited rarely — cache it generously so the public landing is instant
// on repeat visits. Events change more often but are still low-churn.
export function useVillageProfile() {
  return useQuery({
    queryKey: ['village', 'profile'],
    queryFn: () => villageService.profile(),
    staleTime: 10 * 60_000,
  });
}

export function useVillageEvents() {
  return useQuery({
    queryKey: ['village', 'events'],
    queryFn: () => villageService.events(),
    staleTime: 5 * 60_000,
  });
}
