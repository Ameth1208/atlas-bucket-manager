'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionsFilterPopover } from './actions-filter-popover';
import { ActorFilterPopover } from './actor-filter-popover';
import { useI18n } from '@/lib/i18n';
import type { ActivityAction } from '../lib/action-meta';

interface ActivityFiltersBarProps {
  actions: ActivityAction[];
  actor: string;
  counts: Record<string, number>;
  actors: string[];
  grouped: Record<string, ActivityAction[]>;
  resultCount: number;
  isLoading: boolean;
  hasFilters: boolean;
  onToggleAction: (a: ActivityAction) => void;
  onClearActions: () => void;
  onChangeActor: (v: string) => void;
  onClearActor: () => void;
  onClearAll: () => void;
}

export function ActivityFiltersBar({
  actions,
  actor,
  counts,
  actors,
  grouped,
  resultCount,
  isLoading,
  hasFilters,
  onToggleAction,
  onClearActions,
  onChangeActor,
  onClearActor,
  onClearAll,
}: ActivityFiltersBarProps) {
  const { t } = useI18n();
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <ActionsFilterPopover
        actions={actions}
        onToggle={onToggleAction}
        onClear={onClearActions}
        counts={counts}
        grouped={grouped}
      />
      <ActorFilterPopover
        value={actor}
        onChange={onChangeActor}
        actors={actors}
        onClear={onClearActor}
      />
      {hasFilters && (
        <Button variant="pearl" size="sm" onClick={onClearAll}>
          <X size={12} /> {t.activityFilterClearAll}
        </Button>
      )}
      <div className="ml-auto text-[12px] text-muted-foreground tabular-nums">
        {isLoading
          ? '…'
          : `${resultCount} ${
              resultCount === 1 ? t.activityResult : t.activityResults
            }`}
      </div>
    </div>
  );
}
