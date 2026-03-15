import { useQuery, useMutation } from '@tanstack/react-query';
import { measurementApi } from '../measurement.api';
import { keys } from '../../../query/keys';
import { queryClient } from '../../../query/queryClient';
import { useToastStore } from '../../../components/feedback/Toast';
import { mapErrorCode } from '../../../utils/errorMapper';

export function useMeasurements(orderId: string) {
  return useQuery({
    queryKey: keys.measurements.list(orderId),
    queryFn: () => measurementApi.getMeasurements(orderId),
    enabled: !!orderId,
  });
}

export function useRecordMeasurement(orderId: string) {
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (data: any) => measurementApi.recordMeasurement(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.measurements.list(orderId) });
      showToast('New measurement version recorded successfully.');
    },
    onError: (err: any) => {
      showToast(mapErrorCode(err.response?.data?.code), 'error');
    }
  });
}
