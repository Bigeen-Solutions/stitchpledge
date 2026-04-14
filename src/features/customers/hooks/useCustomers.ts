import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi, type CreateCustomerRequest } from '../customers.api.ts';
import { keys } from '../../../query/keys.ts';

export function useCustomers(page = 1, limit = 10, search = '') {
  return useQuery({
    queryKey: keys.customers.list(page, limit, search),
    queryFn: () => customersApi.getCustomers(page, limit, search),
    staleTime: 1000 * 60, // 1 minute
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page/search
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customersApi.createCustomer(data),
    onSuccess: () => {
      // Invalidate the customers list so the new customer appears
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
