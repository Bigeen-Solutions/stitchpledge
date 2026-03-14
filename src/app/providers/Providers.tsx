import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../query/queryClient';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
