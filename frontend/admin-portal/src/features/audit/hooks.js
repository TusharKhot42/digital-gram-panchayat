import { useQuery } from '@tanstack/react-query';
import { auditService } from './auditService';

export function useAuditLog(params) {
  return useQuery({
    queryKey: ['audit', params ?? {}],
    queryFn: () => auditService.list(params),
    placeholderData: (prev) => prev,
  });
}
