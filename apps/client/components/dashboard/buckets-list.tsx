'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useBuckets } from '@/hooks/use-buckets';
import { useProviders } from '@/hooks/use-providers';
import { BucketCard } from './bucket-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Database, Plug } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

interface BucketsListProps {
  search?: string;
}

export function BucketsList({ search = '' }: BucketsListProps) {
  const { buckets, providerErrors, isLoading } = useBuckets();
  const { providers } = useProviders();
  const { setCreateBucketOpen, setEditProviderId, setConnectProviderOpen } = useAppStore();
  const { t, tx } = useI18n();

  const { data: statsMap = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['buckets-stats', buckets.map(b => `${b.providerId}:${b.name}`).sort().join(',')],
    queryFn: () => api.buckets.statsMany().then((res) => res.stats),
    enabled: buckets.length > 0,
    staleTime: 30_000,
  });

  const filteredBuckets = search.trim()
    ? buckets.filter(b => b.name.toLowerCase().includes(search.toLowerCase().trim()))
    : buckets;

  if (isLoading || statsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 sm:h-36 rounded-md bg-muted" />)}
      </div>
    );
  }

  if (filteredBuckets.length === 0) {
    if (search.trim()) {
      return (
        <Card className="border-dashed border-border bg-muted">
          <CardContent className="flex flex-col items-center justify-center py-10 sm:py-12 text-center px-4">
            <Database size={36} className="mb-3 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-[14px] sm:text-[15px] text-foreground mb-4 tracking-[-0.224px]">
              {tx('dashboardBucketsEmpty', { name: search.trim() })}
            </p>
          </CardContent>
        </Card>
      );
    }

    if (providerErrors.length > 0) {
      const single = providerErrors.length === 1;
      return (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col gap-3 py-6 px-5">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={18} strokeWidth={1.75} />
              <p className="text-[14px] font-semibold tracking-[-0.224px]">
                {tx('providerErrorsTitle', { count: providerErrors.length, single: String(single) })}
              </p>
            </div>
            <p className="text-[12px] text-muted-foreground">
              {t.providerErrorsHint}
            </p>
            <div className="flex flex-col gap-2 mt-1">
              {providerErrors.map(err => (
                <div
                  key={err.providerId}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl border border-border bg-card"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{err.providerName}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 break-words">{err.error}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="pearl"
                    onClick={() => setEditProviderId(err.providerId)}
                  >
                    <Plug size={12} /> {t.edit}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (providers.length === 0) {
      return (
        <Card className="border-dashed border-border bg-muted">
          <CardContent className="flex flex-col items-center justify-center py-10 sm:py-12 text-center px-4">
            <Database size={36} className="mb-3 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-[14px] sm:text-[15px] text-foreground mb-4 tracking-[-0.224px]">
              {t.providerConnectFirst}
            </p>
            <Button onClick={() => setConnectProviderOpen(true)}>{t.providerConnect}</Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-dashed border-border bg-muted">
        <CardContent className="flex flex-col items-center justify-center py-10 sm:py-12 text-center px-4">
          <Database size={36} className="mb-3 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-[14px] sm:text-[15px] text-foreground mb-4 tracking-[-0.224px]">{t.bucketEmptyNoBuckets}</p>
          <Button onClick={() => setCreateBucketOpen(true)}>{t.bucketEmptyCreateFirst}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {providerErrors.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col gap-2 py-3 px-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={15} strokeWidth={1.75} />
              <p className="text-[12px] font-semibold tracking-[-0.224px]">
                {providerErrors.length}{' '}
                {providerErrors.length === 1 ? t.providerErrorSingle : t.providerErrorPlural}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 mt-1">
              {providerErrors.map(err => (
                <div
                  key={err.providerId}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border bg-card"
                >
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">{err.providerName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{err.error}</p>
                  </div>
                  <Button size="sm" variant="pearl" onClick={() => setEditProviderId(err.providerId)}>
                    <Plug size={11} /> {t.edit}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredBuckets.map(b => {
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
            />
          );
        })}
      </div>
    </div>
  );
}
