'use client';
import { useState } from 'react';
import { useBucketStats } from '@/hooks/use-buckets';
import { QuotaBar } from '@/components/ui/quota-bar';
import { fmtBytes, fmtDate } from '@/lib/utils';
import { Database, File, RefreshCw, Key } from 'lucide-react';
import type { Bucket } from '@/lib/api';
import { Card } from '../ui/card';
import { BucketActions } from './bucket-actions';
import { UploadDialog } from './upload-dialog';
import { useRouter } from 'next/navigation';

interface BucketHeaderProps {
  bucket: Bucket;
}

export function BucketHeader({ bucket }: BucketHeaderProps) {
  const { data: stats } = useBucketStats(bucket.name, bucket.providerId);
  const router = useRouter();
  const [uploadOpen, setUploadOpen] = useState(false);

  const statsData = [
    {
      icon: File,
      label: 'Objetos',
      value: stats?.totalObjects?.toLocaleString() ?? '—',
    },
    {
      icon: Database,
      label: 'Espacio',
      value: stats?.totalSize ? fmtBytes(stats.totalSize) : '—',
    },
    {
      icon: RefreshCw,
      label: 'Actualizado',
      value: bucket.creationDate ? fmtDate(bucket.creationDate) : '—',
    },
    {
      icon: Key,
      label: bucket.limit ? 'Cuota' : 'Sin límite',
      value: bucket.limit
        ? `${stats?.totalSize ? fmtBytes(stats.totalSize) : '0 B'} / ${fmtBytes(bucket.limit)}`
        : 'Ilimitado',
      progress: bucket.limit ? { used: stats?.totalSize ?? 0, limit: bucket.limit } : undefined,
    },
  ];
  const handleCloned = (newBucket: Bucket) => {
    router.push(`/buckets/${encodeURIComponent(newBucket.name)}?provider=${newBucket.providerId}`);
  };

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted">
            <Database size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold uppercase tracking-tight text-foreground">{bucket.name}</h1>
            <p className="text-xs text-muted-foreground">{bucket.providerName}</p>
          </div>
        </div>

        <BucketActions
          bucket={bucket}
          onDeleted={() => router.push('/dashboard')}
          onCloned={handleCloned}
          onUpload={() => setUploadOpen(true)}
        />
      </div>

      <Card className="rounded-xl overflow-hidden shadow-none">
        <div className="grid grid-cols-4">
          {statsData.map((stat) => (
            <div
              key={stat.label}
              className="py-6 px-4 border-r border-border last:border-r-0"
            >
              <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground mb-1">
                <stat.icon size={11} />
                {stat.label}
              </div>
              {stat.progress ? (
                <>
                  <p className="text-sm font-medium mb-1.5">{stat.value}</p>
                  <QuotaBar used={stat.progress.used} limit={stat.progress.limit} />
                </>
              ) : (
                <p className="text-lg font-semibold">{stat.value}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
