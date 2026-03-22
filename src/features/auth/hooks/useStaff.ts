import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "../staff.api";
import type { InviteStaffRequest } from "../staff.api";
import { keys } from "../../../query/keys";
import { useDomainError } from "../../../lib/errors";
import { useAuthStore } from "../auth.store";

export function useStaffList() {
  return useQuery({
    queryKey: keys.staff.all,
    queryFn: () => staffApi.getStaff(),
  });
}

export function useInviteStaff() {
  const queryClient = useQueryClient();
  const { handleError } = useDomainError();
  return useMutation({
    mutationFn: (data: InviteStaffRequest) => staffApi.inviteStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.staff.all });
    },
    onError: (err: any) => handleError(err),
  });
}

export function useUpdateStaffStatus() {
  const queryClient = useQueryClient();
  const { handleError } = useDomainError();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      staffApi.updateStaffStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.staff.all });
    },
    onError: (err: any) => handleError(err),
  });
}

export function useStores() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["stores"],
    queryFn: () => staffApi.getStores(),
    enabled: user?.role === 'OWNER',
  });
}
