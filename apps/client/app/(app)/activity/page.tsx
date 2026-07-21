'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Toolbar } from '@/components/layout/toolbar';
import { ActivityTable } from './components/activity-table';
import { ActivityFiltersBar } from './components/activity-filters-bar';
import { useActivityFilters } from './hooks/use-activity-filters';
import { useI18n } from '@/lib/i18n';

export default function ActivityPage() {
  const { t } = useI18n();
  const filters = useActivityFilters(200);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: t.activityTitle }]} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <DashboardHeader title={t.activityTitle} subtitle={t.activitySubtitle} />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse bg-success" />
            <span className="text-[12px] text-muted-foreground">{t.activityLiveTag}</span>
          </div>
        </div>

        <ActivityFiltersBar
          actions={filters.actions}
          actor={filters.actor}
          counts={filters.counts}
          actors={filters.actors}
          grouped={filters.grouped}
          resultCount={filters.resultCount}
          isLoading={filters.isLoading}
          hasFilters={filters.hasFilters}
          onToggleAction={filters.toggleAction}
          onClearActions={filters.clearActions}
          onChangeActor={filters.setActor}
          onClearActor={() => filters.setActor('')}
          onClearAll={filters.clearAll}
        />

        <ActivityTable
          entries={filters.entries ?? []}
          isLoading={filters.isLoading}
        />
      </div>
    </div>
  );
}
