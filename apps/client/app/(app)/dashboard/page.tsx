'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useBuckets } from '@/hooks/use-buckets';
import { useProviders } from '@/hooks/use-providers';
import { Toolbar } from '@/components/layout/toolbar';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { FileTypeChart } from '@/components/dashboard/file-type-chart';
import { useDashboardStats } from './hooks/use-dashboard-stats';
import { DashboardHeader } from './components/dashboard-header';
import { DashboardStats } from './components/dashboard-stats';
import { BucketsPanel } from './components/buckets-panel';
import { ActivityPanel } from './components/activity-panel';

export default function DashboardPage() {
  const { t } = useI18n();
  const { setCreateBucketOpen, setConnectProviderOpen } = useAppStore();
  const [search, setSearch] = useState('');

  const { buckets } = useBuckets();
  const { providers } = useProviders();
  const { data: activity = [] } = useQuery({ queryKey: ['activity'], queryFn: () => api.activity.list(10) });
  const { data: fileTypes = [] } = useQuery({
    queryKey: ['file-types'],
    queryFn: () => api.objects.fileTypes(),
    enabled: buckets.length > 0,
  });
  const { totalSize, totalObjects, publicBuckets } = useDashboardStats(buckets);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: t.dashboardTitle }]} />

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col h-full gap-4">
            <DashboardHeader
              onConnectProvider={() => setConnectProviderOpen(true)}
              onCreateBucket={() => setCreateBucketOpen(true)}
            />

            <DashboardStats
              bucketsCount={buckets.length}
              providersCount={providers.length}
              totalSize={totalSize}
              totalObjects={totalObjects}
              publicBuckets={publicBuckets}
              activity={activity}
            />

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <BucketsPanel search={search} setSearch={setSearch} bucketsCount={buckets.length} />

              <div className="flex flex-col min-h-0 gap-4">
                <div className="h-[280px] shrink-0">
                  <FileTypeChart data={fileTypes} />
                </div>

                <ActivityPanel activity={activity} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
