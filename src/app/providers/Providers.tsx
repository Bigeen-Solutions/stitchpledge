import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../query/queryClient';
import type { ReactNode } from 'react';
import { ThemeRegistry } from '../../design-system/theme';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeRegistry>
        {children}
      </ThemeRegistry>
    </QueryClientProvider>
  );
}
