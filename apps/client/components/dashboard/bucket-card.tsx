'use client';
import { Database, Globe, Lock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { QuotaBar } from '@/components/ui/quota-bar';
import { fmtDate, fmtBytes } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Bucket } from '@/lib/api';
import { BucketCardActions } from './bucket-card-actions';

interface BucketCardProps {
  bucket: Bucket & { used?: number; totalObjects?: number };
  providerColor?: string;
}

export function BucketCard({ bucket }: BucketCardProps) {
  const router = useRouter();
  const displayUsed = bucket.used ?? 0;
  const displayLimit = bucket.limit;
  const pct = displayLimit ? Math.min(100, Math.round(displayUsed / displayLimit * 100)) : 0;
  const pctColor =
    pct > 85 ? 'text-destructive' : pct > 65 ? 'text-warning' : 'text-muted-foreground';

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

          <Badge variant={bucket.isPublic ? 'success' : 'secondary'} className="shrink-0 gap-1 h-5 text-[11px]">
            {bucket.isPublic ? <Globe size={10} /> : <Lock size={10} />}
            {bucket.isPublic ? 'Público' : 'Privado'}
          </Badge>
        </div>

        {displayLimit ? (
          <QuotaBar used={displayUsed} limit={displayLimit} />
        ) : (
          <div className="h-1.5 rounded-full bg-muted" />
        )}

        <div className="flex justify-between items-center mt-3 text-[12px]">
          <span className="text-muted-foreground">{bucket.totalObjects?.toLocaleString() ?? '—'} objetos</span>
          <span className="text-muted-foreground tabular-nums">
            {displayLimit
              ? `${fmtBytes(displayUsed)} / ${fmtBytes(displayLimit)}`
              : fmtBytes(displayUsed)}
          </span>
        </div>

        <div className="flex justify-between items-center mt-1.5 text-[11.5px]">
          <span className="text-muted-foreground/80">{bucket.creationDate ? fmtDate(bucket.creationDate) : '—'}</span>
          {pct > 0 && (
            <span className={cn('font-medium tabular-nums', pctColor)}>{pct}% usado</span>
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
