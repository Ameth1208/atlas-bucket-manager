'use client';
import { Database, Globe, Lock, ChevronRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { QuotaBar } from '@/components/ui/quota-bar';
import { fmtDate, fmtBytes } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import type { Bucket } from '@/lib/api';
import { BucketCardActions } from './bucket-card-actions';

interface BucketCardProps {
  bucket: Bucket & { used?: number; totalObjects?: number };
  providerColor?: string;
}

export function BucketCard({ bucket }: BucketCardProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const { t, tx } = useI18n();
  const displayUsed = bucket.used ?? 0;
  const displayLimit = bucket.limit;
  const pct = displayLimit ? Math.min(100, Math.round((displayUsed / displayLimit) * 100)) : 0;
  const pctColor =
    pct > 85 ? 'text-destructive' : pct > 65 ? 'text-warning' : 'text-muted-foreground';
  const objectsLabel = bucket.totalObjects != null ? bucket.totalObjects.toLocaleString() : '—';

  const favMutation = useMutation({
    mutationFn: () =>
      bucket.isFavorite
        ? api.favorites.remove(bucket.providerId, bucket.name)
        : api.favorites.add(bucket.providerId, bucket.name),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['buckets'] });
      const prev = qc.getQueryData<{ buckets: Bucket[] }>(['buckets']);
      if (prev) {
        qc.setQueryData<{ buckets: Bucket[] }>(['buckets'], {
          ...prev,
          buckets: prev.buckets.map((b) =>
            b.providerId === bucket.providerId && b.name === bucket.name
              ? { ...b, isFavorite: !b.isFavorite }
              : b
          ),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['buckets'], ctx.prev);
      toast.error(t.toastDeleteError);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['buckets'] });
      qc.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return (
    <Card
      className={cn(
        'cursor-pointer group relative overflow-hidden border-border bg-card hover:shadow-sm transition-all duration-300'
      )}
      onClick={() => router.push(`/buckets/${encodeURIComponent(bucket.name)}?provider=${bucket.providerId}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-muted border border-border">
            <Database size={17} className="text-muted-foreground" strokeWidth={1.8} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-foreground truncate tracking-[-0.2px]">{bucket.name}</p>
            <p className="text-[12px] text-muted-foreground truncate mt-0.5">{bucket.providerName || bucket.providerId}</p>
          </div>

          <button
            type="button"
            aria-label={bucket.isFavorite ? t.favoritesRemove : t.favoritesAdd}
            onClick={(e) => {
              e.stopPropagation();
              favMutation.mutate();
            }}
            className="shrink-0 size-6 grid place-items-center rounded-md text-muted-foreground hover:text-warning transition-colors"
          >
            <Star
              size={14}
              className={bucket.isFavorite ? 'text-warning' : ''}
              fill={bucket.isFavorite ? 'currentColor' : 'none'}
            />
          </button>

          <Badge variant={bucket.isPublic ? 'success' : 'secondary'} className="shrink-0 gap-1 h-5 text-[11px]">
            {bucket.isPublic ? <Globe size={10} /> : <Lock size={10} />}
            {bucket.isPublic ? t.bucketBadgePublic : t.bucketBadgePrivate}
          </Badge>
        </div>

        {displayLimit ? (
          <QuotaBar used={displayUsed} limit={displayLimit} />
        ) : (
          <div className="h-1.5 rounded-full bg-muted" />
        )}

        <div className="flex justify-between items-center mt-3 text-[12px]">
          <span className="text-muted-foreground">{tx('bucketObjectsLabel', { count: objectsLabel })}</span>
          <span className="text-muted-foreground tabular-nums">
            {displayLimit
              ? `${fmtBytes(displayUsed)} / ${fmtBytes(displayLimit)}`
              : fmtBytes(displayUsed)}
          </span>
        </div>

        <div className="flex justify-between items-center mt-1.5 text-[11.5px]">
          <span className="text-muted-foreground/80">{bucket.creationDate ? fmtDate(bucket.creationDate) : '—'}</span>
          {pct > 0 && (
            <span className={cn('font-medium tabular-nums', pctColor)}>{tx('bucketPctUsed', { pct })}</span>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <BucketCardActions bucket={bucket} />
          <div className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300">
            <ChevronRight size={16} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
