'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useBuckets } from '@/hooks/use-buckets';
import { BucketCard } from './bucket-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Database } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

export function BucketsList() {
  const { buckets, isLoading } = useBuckets();
  const { setCreateBucketOpen } = useAppStore();

  const { data: statsMap = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['buckets-stats', buckets.map(b => `${b.providerId}:${b.name}`).join(',')],
    queryFn: async () => {
      const map: Record<string, { totalSize: number; totalObjects: number }> = {};
      await Promise.allSettled(
        buckets.map(async b => {
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

  if (isLoading || statsLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
      </div>
    );
  }

  if (buckets.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Database size={36} className="mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mb-4">No hay buckets configurados</p>
          <Button onClick={() => setCreateBucketOpen(true)}>Crear primer bucket</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {buckets.map(b => {
        const key = `${b.providerId}:${b.name}`;
        const stats = statsMap[key];
        return (
          <BucketCard
            key={key}
            bucket={{
              ...b,
              used: stats?.totalSize,
              totalObjects: stats?.totalObjects,
            }}
            providerColor={b.providerId === 'minio' ? '#f43f5e' : b.providerId === 'aws' ? '#3b82f6' : '#10b981'}
          />
        );
      })}
    </div>
  );
}
