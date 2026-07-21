'use client';

import { Toolbar } from '@/components/layout/toolbar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card } from '@/components/ui/card';
import { BucketsList } from '@/components/dashboard/buckets-list';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { useBucketsIndex } from './hooks/use-buckets-index';
import { BucketsIndexToolbar } from './components/buckets-index-toolbar';

export default function BucketsIndexPage() {
  const { t, tx } = useI18n();
  const { setCreateBucketOpen } = useAppStore();
  const { search, setSearch, buckets, filtered, isLoading } = useBucketsIndex();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: t.bucketsIndexTitle }]} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <DashboardHeader
            title={t.bucketsIndexTitle}
            subtitle={tx('bucketsIndexSubtitle', { count: buckets.length })}
          />
          <div className="text-[12px] text-muted-foreground tabular-nums">
            {isLoading
              ? t.bucketsIndexLoading
              : `${filtered.length} ${
                  filtered.length === 1 ? t.bucketsIndexResult : t.bucketsIndexResults
                }`}
          </div>
        </div>

        <Card className="border-border overflow-hidden">
          <BucketsIndexToolbar
            search={search}
            onSearchChange={setSearch}
            onCreate={() => setCreateBucketOpen(true)}
          />
          <div className="p-5">
            <BucketsList search={search} />
          </div>
        </Card>
      </div>
    </div>
  );
}
