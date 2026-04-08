import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../customers.api.ts';
import { keys } from '../../../query/keys.ts';

export function useCustomers(page = 1, limit = 10, search = '') {
  return useQuery({
    queryKey: keys.customers.list(page, limit, search),
    queryFn: () => customersApi.getCustomers(page, limit, search),
    staleTime: 1000 * 60, // 1 minute
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page/search
  });
}
