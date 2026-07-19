'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ActivityFilterState {
  action?: string;
  actor?: string;
  bucket?: string;
  provider?: string;
  from?: number;
  to?: number;
}

export function useActivity(limit = 100, filters: ActivityFilterState = {}) {
  return useQuery({
    queryKey: ['activity-full', filters, limit],
    queryFn: () => api.activity.list(limit, 0, filters),
    refetchInterval: 10_000,
  });
}
