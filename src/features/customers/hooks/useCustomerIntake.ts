import { useQuery, useMutation } from "@tanstack/react-query";
import { customersApi } from "../customers.api";
import type { CreateCustomerRequest } from "../customers.api";
import { measurementsApi } from "../../measurements/measurements.api";
import { keys } from "../../../query/keys";
import { useDomainError } from "../../../lib/errors";

export function useCustomerSearch(query: string) {
  return useQuery({
    queryKey: keys.customers.search(query),
    queryFn: () => customersApi.searchCustomers(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateCustomer() {
  const { handleError } = useDomainError();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customersApi.createCustomer(data),
    onError: (err: any) => handleError(err),
  });
}

export function useCreateMeasurement() {
  const { handleError } = useDomainError();
  return useMutation({
    mutationFn: (data: { customerId: string; measurements: Record<string, number> }) =>
      measurementsApi.createMeasurement(data),
    onError: (err: any) => handleError(err),
  });
}
