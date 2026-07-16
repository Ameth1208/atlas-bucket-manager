'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useActivity(limit = 100) {
  return useQuery({
    queryKey: ['activity-full'],
    queryFn: () => api.activity.list(limit),
    refetchInterval: 10_000,
  });
}
