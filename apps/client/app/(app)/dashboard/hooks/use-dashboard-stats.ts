'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Bucket } from '@/lib/api';

export function useDashboardStats(buckets: Bucket[]) {
  const { data: statsMap = {} } = useQuery({
    queryKey: ['buckets-stats', buckets.map((b) => `${b.providerId}:${b.name}`).join(',')],
    queryFn: async () => {
      const map: Record<string, { totalSize: number; totalObjects: number }> = {};
      await Promise.allSettled(
        buckets.map(async (b) => {
          try {
            const stats = await api.buckets.stats(b.name, b.providerId);
            map[`${b.providerId}:${b.name}`] = stats;
          } catch {
            map[`${b.providerId}:${b.name}`] = { totalSize: 0, totalObjects: 0 };
          }
        })
      );
      return map;
    },
    enabled: buckets.length > 0,
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
