'use client';
import { useQuery } from '@tanstack/react-query';
import { useBucketStats } from '@/hooks/use-buckets';
import { QuotaBar } from '@/components/ui/quota-bar';
import { fmtBytes, fmtDate } from '@/lib/utils';
import { Database, File, RefreshCw } from 'lucide-react';
import type { Bucket } from '@/lib/api';

interface BucketHeaderProps {
  bucket: Bucket;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function BucketHeader({ bucket, onRefresh, isRefreshing }: BucketHeaderProps) {
  const { data: stats, refetch } = useBucketStats(bucket.name, bucket.providerId);

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted">
            <Database size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{bucket.name}</h1>
            <p className="text-sm text-muted-foreground">{bucket.providerName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <File size={12} />
            Objetos
          </div>
          <p className="text-lg font-semibold">{stats?.totalObjects?.toLocaleString() ?? '—'}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Database size={12} />
            Espacio
          </div>
          <p className="text-lg font-semibold">{stats?.totalSize ? fmtBytes(stats.totalSize) : '—'}</p>
        </div>

        {bucket.limit && (
          <div className="rounded-lg border border-border bg-card p-3 col-span-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Cuota</span>
              <span className="font-medium">
                {stats?.totalSize ? fmtBytes(stats.totalSize) : '0 B'} / {fmtBytes(bucket.limit)}
              </span>
            </div>
            <QuotaBar used={stats?.totalSize ?? 0} limit={bucket.limit} />
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <RefreshCw size={12} />
            Actualizado
          </div>
          <p className="text-sm font-medium">{bucket.creationDate ? fmtDate(bucket.creationDate) : '—'}</p>
        </div>
      </div>
    </div>
  );
}
