import { useQuery } from '@tanstack/react-query';
import { dashboardService } from './dashboardService';

// Auto-refresh every 30s so the officer dashboard stays live.
const REFRESH_MS = 30_000;

export function useMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => dashboardService.metrics(),
    refetchInterval: REFRESH_MS,
  });
}

export function useCharts() {
  return useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: () => dashboardService.charts(),
    refetchInterval: REFRESH_MS,
  });
}

export function useActivity() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => dashboardService.activity(),
    refetchInterval: REFRESH_MS,
  });
}
