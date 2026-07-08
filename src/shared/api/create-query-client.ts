import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './api-error.type';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.code === 401) return false;
          return failureCount < 3;
        },
      },
    },
  });
