'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Bucket } from '@/lib/api';

export function useDashboardStats(buckets: Bucket[]) {
  const { data: statsMap = {} } = useQuery({
    queryKey: ['buckets-stats', buckets.map((b) => `${b.providerId}:${b.name}`).sort().join(',')],
    queryFn: () => api.buckets.statsMany().then((res) => res.stats),
    enabled: buckets.length > 0,
    staleTime: 30_000,
  });

  const totalSize = buckets.reduce((sum, b) => {
    const stats = statsMap[`${b.providerId}:${b.name}`];
    return sum + (stats?.totalSize ?? 0);
  }, 0);

  const totalObjects = buckets.reduce((sum, b) => {
    const stats = statsMap[`${b.providerId}:${b.name}`];
    return sum + (stats?.totalObjects ?? 0);
  }, 0);

  const publicBuckets = buckets.filter((b) => b.isPublic).length;

  return { statsMap, totalSize, totalObjects, publicBuckets };
}
