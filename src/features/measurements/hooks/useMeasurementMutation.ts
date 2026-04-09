import { useQuery, useMutation } from '@tanstack/react-query';
import { measurementApi } from '../measurement.api';
import { keys } from '../../../query/keys';
import { queryClient } from '../../../query/queryClient';
import { useToastStore } from '../../../components/feedback/Toast';
import { useDomainError } from '../../../lib/errors';

export function useMeasurements(orderId: string) {
  return useQuery({
    queryKey: keys.measurements.list(orderId),
    queryFn: () => measurementApi.getMeasurements(orderId),
    enabled: !!orderId,
  });
}

export function useRecordMeasurement(customerId: string) {
  const showToast = useToastStore((state) => state.showToast);
  const { handleError } = useDomainError();

  return useMutation({
    mutationFn: (measurements: Record<string, number>) => measurementApi.recordMeasurement(customerId, measurements),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.measurements.list(customerId) });
      showToast('Measurement Recorded', 'New measurement version recorded successfully.');
    },
    onError: (err: any) => {
      handleError(err);
    }
  });
}
