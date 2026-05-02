import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { disputeApi, RaiseDisputeDTO, SubmitEvidenceDTO, ResolveDisputeDTO } from './dispute.api';
import { keys } from '../../query/keys';
import { useToastStore } from '../../components/feedback/Toast';

/**
 * useDisputeProjection
 * 
 * Subscribes the UI to the backend's standoff projection.
 */
export function useDisputeProjection(orderId: string) {
  return useQuery({
    queryKey: keys.disputes.projection(orderId),
    queryFn: () => disputeApi.getProjection(orderId),
    enabled: !!orderId,
    retry: false
  });
}

/**
 * useRaiseDispute
 * 
 * Mutation to initialize the arbitration state machine.
 */
export function useRaiseDispute() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (dto: RaiseDisputeDTO) => disputeApi.raiseDispute(dto),
    onSuccess: (_, variables) => {
      // PURE REFRESH: Invalidate and refetch server state
      queryClient.invalidateQueries({ queryKey: keys.disputes.projection(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: keys.orders.detail(variables.orderId) });
      showToast("Dispute raised. Physical workflow frozen.", "warning");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to raise dispute";
      showToast(message, "error");
    }
  });
}

/**
 * useSubmitEvidence
 */
export function useSubmitEvidence(orderId: string) {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (dto: SubmitEvidenceDTO) => disputeApi.submitEvidence(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.disputes.projection(orderId) });
      showToast("Evidence submitted for review.", "success");
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || "Failed to submit evidence", "error");
    }
  });
}

/**
 * useResolveDispute
 */
export function useResolveDispute(orderId: string) {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (dto: ResolveDisputeDTO) => disputeApi.resolveDispute(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.disputes.projection(orderId) });
      queryClient.invalidateQueries({ queryKey: keys.orders.detail(orderId) });
      showToast("Dispute resolved. Production resumed.", "success");
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || "Resolution quorum failed", "error");
    }
  });
}
