import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../customer.api';

export function useCustomerOrder(orderId: string) {
  return useQuery({
    queryKey: ['customer', 'order', orderId],
    queryFn: () => customerApi.getCustomerOrder(orderId),
    enabled: !!orderId,
    retry: false,
  });
}
