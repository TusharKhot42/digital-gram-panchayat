import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from './userService';

export const userKeys = {
  list: (params) => ['admin-users', 'list', params ?? {}],
  detail: (id) => ['admin-users', 'detail', id],
};

export function useUsers(params) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getOne(id),
    enabled: Boolean(id),
  });
}

export function useSetUserStatus(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id: uid, status }) => userService.setStatus(uid ?? id, status),
    onSuccess: (updated) => {
      if (updated?.id) qc.setQueryData(userKeys.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: ['admin-users', 'list'] });
      qc.invalidateQueries({ queryKey: ['admin-officers', 'list'] });
    },
  });
}

export function useAdmins(params) {
  return useQuery({
    queryKey: ['admin-officers', 'list', params ?? {}],
    queryFn: () => userService.listAdmins(params),
    placeholderData: (prev) => prev,
  });
}

export function useRegisterAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => userService.registerAdmin(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-officers', 'list'] });
      qc.invalidateQueries({ queryKey: ['admin-users', 'list'] });
    },
  });
}
