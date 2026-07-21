'use client';
import { useBucketStats, useBuckets } from '@/hooks/use-buckets';
import { QuotaBar } from '@/components/ui/quota-bar';
import { fmtBytes, fmtDate } from '@/lib/utils';
import { Database, File, RefreshCw, Key } from 'lucide-react';
import type { Bucket } from '@/lib/api';
import { Card } from '../ui/card';
import { BucketActions } from './bucket-actions';
import { BucketSwitcher } from './bucket-switcher';
import { UploadDialog } from './upload-dialog';
import { NewFolderDialog } from '@/app/(app)/buckets/[name]/components/new-folder-dialog';
import { useRouter } from 'next/navigation';
import { useBucketUIStore } from '@/app/(app)/buckets/[name]/store/ui';
import { useI18n } from '@/lib/i18n';

interface BucketHeaderProps {
  bucket: Bucket;
}

export function BucketHeader({ bucket }: BucketHeaderProps) {
  const { data: stats } = useBucketStats(bucket.name, bucket.providerId);
  const { buckets } = useBuckets();
  const { t, tx } = useI18n();
  const router = useRouter();
  const uploadOpen = useBucketUIStore(s => s.uploadOpen);
  const setUploadOpen = useBucketUIStore(s => s.setUploadOpen);
  const newFolderOpen = useBucketUIStore(s => s.newFolderOpen);
  const setNewFolderOpen = useBucketUIStore(s => s.setNewFolderOpen);

  const statsData = [
    {
      icon: File,
      label: t.bucketObjects,
      value: stats?.totalObjects?.toLocaleString() ?? '—',
    },
    {
      icon: Database,
      label: t.bucketUsedSpace,
      value: stats?.totalSize ? fmtBytes(stats.totalSize) : '—',
    },
    {
      icon: RefreshCw,
      label: t.bucketUpdated,
      value: bucket.creationDate ? fmtDate(bucket.creationDate) : '—',
    },
    {
      icon: Key,
      label: bucket.limit ? t.bucketQuota : t.bucketNoLimit,
      value: bucket.limit
        ? `${stats?.totalSize ? fmtBytes(stats.totalSize) : '0 B'} / ${fmtBytes(bucket.limit)}`
        : t.bucketUnlimited,
      progress: bucket.limit ? { used: stats?.totalSize ?? 0, limit: bucket.limit } : undefined,
    },
  ];
  const handleCloned = (newBucket: Bucket) => {
    router.push(`/buckets/${encodeURIComponent(newBucket.name)}?provider=${newBucket.providerId}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-primary-soft text-primary shrink-0">
            <Database size={20} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground truncate">{bucket.name}</h1>
            <p className="text-[12px] text-muted-foreground truncate">{bucket.providerName}</p>
          </div>
        </div>

        <BucketActions
          bucket={bucket}
          onDeleted={() => router.push('/dashboard')}
          onCloned={handleCloned}
          onUpload={() => setUploadOpen(true)}
          onNewFolder={() => setNewFolderOpen(true)}
        />
      </div>

      <div className="flex items-center justify-between gap-2 -mt-1">
        <BucketSwitcher current={bucket} />
        <span className="text-[11.5px] text-muted-foreground">
          {tx('dashboardBucketsSubtitle', { count: buckets.length })}
        </span>
      </div>

      <Card>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {statsData.map((stat) => (
            <div
              key={stat.label}
              className="px-5 py-4 first:pl-5 last:pr-5"
            >
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-1.5">
                <stat.icon size={11} strokeWidth={1.8} />
                {stat.label}
              </div>
              {stat.progress ? (
                <>
                  <p className="text-[14px] font-semibold text-foreground tabular-nums mb-2">{stat.value}</p>
                  <QuotaBar used={stat.progress.used} limit={stat.progress.limit} />
                </>
              ) : (
                <p className="text-[15px] font-semibold text-foreground tabular-nums">{stat.value}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <NewFolderDialog open={newFolderOpen} onOpenChange={setNewFolderOpen} />
    </div>
  );
}
