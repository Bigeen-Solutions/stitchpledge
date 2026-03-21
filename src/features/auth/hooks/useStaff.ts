import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "../staff.api";
import type { InviteStaffRequest } from "../staff.api";
import { keys } from "../../../query/keys";

export function useStaffList() {
  return useQuery({
    queryKey: keys.staff.all,
    queryFn: () => staffApi.getStaff(),
  });
}

export function useInviteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteStaffRequest) => staffApi.inviteStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.staff.all });
    },
  });
}

export function useUpdateStaffStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      staffApi.updateStaffStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.staff.all });
    },
  });
}

export function useStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: () => staffApi.getStores(),
  });
}
