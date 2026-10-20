'use client';

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-[26px] sm:text-[32px] font-bold text-foreground tracking-tight leading-tight">
              {t.activityTitle}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {t.activitySubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card/60 border border-white/[0.08] backdrop-blur-md shadow-xs self-start sm:self-auto">
            <span className="size-2 rounded-full animate-pulse bg-[#34c759]" />
            <span className="text-xs font-medium text-muted-foreground">{t.activityLiveTag}</span>
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
