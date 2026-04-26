'use client';
import { Database, Globe, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { QuotaBar } from '@/components/ui/quota-bar';
import { fmtDate, fmtBytes } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface BucketCardProps {
  bucket: {
    name: string;
    providerId: string;
    providerName?: string;
    isPublic?: boolean;
    used?: number;
    limit?: number;
    creationDate?: string;
    totalObjects?: number;
  };
  providerColor?: string;
}

export function BucketCard({ bucket, providerColor }: BucketCardProps) {
  const router = useRouter();
  const pct = bucket.limit ? Math.min(100, Math.round((bucket.used ?? 0) / bucket.limit * 100)) : 0;

  return (
    <Card
      className="cursor-pointer hover:ring-2 hover:ring-primary/30 hover:shadow-md transition-all duration-200 active:scale-[0.99]"
      onClick={() => router.push(`/buckets/${encodeURIComponent(bucket.name)}?provider=${bucket.providerId}`)}
    >
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-muted">
            <Database size={16} style={{ color: providerColor ?? 'hsl(var(--primary))' }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{bucket.name}</p>
            <p className="text-xs text-muted-foreground truncate">{bucket.providerName || bucket.providerId}</p>
          </div>

          <Badge variant={bucket.isPublic ? 'outline' : 'secondary'} className="shrink-0 gap-1">
            {bucket.isPublic ? <Globe size={10} /> : <Lock size={10} />}
            {bucket.isPublic ? 'Público' : 'Privado'}
          </Badge>
        </div>

        <QuotaBar used={bucket.used ?? 0} limit={bucket.limit ?? 0} />

        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>{bucket.totalObjects?.toLocaleString() ?? '—'} objetos</span>
          <span>{bucket.limit ? `${fmtBytes(bucket.used ?? 0)} / ${fmtBytes(bucket.limit)}` : '—'}</span>
        </div>

        <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
          <span>{bucket.creationDate ? fmtDate(bucket.creationDate) : '—'}</span>
          {pct > 0 && (
            <span className={pct > 85 ? 'text-destructive' : pct > 65 ? 'text-orange-500' : ''}>{pct}% usado</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
