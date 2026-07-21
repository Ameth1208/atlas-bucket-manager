'use client';

import { useMemo, useState, useCallback } from 'react';
import { useActivity } from './use-activity';
import {
  countByAction,
  groupActions,
  uniqueActors,
} from '../lib/activity-aggregation';
import type { ActivityAction } from '../lib/action-meta';

export interface UseActivityFiltersResult {
  actions: ActivityAction[];
  actor: string;
  setActor: (v: string) => void;
  toggleAction: (a: ActivityAction) => void;
  clearAction: (a: ActivityAction) => void;
  clearActions: () => void;
  clearAll: () => void;
  hasFilters: boolean;
  grouped: Record<string, ActivityAction[]>;
  counts: Record<string, number>;
  actors: string[];
  entries: ReturnType<typeof useActivity>['data'];
  isLoading: boolean;
  resultCount: number;
}

export function useActivityFilters(limit = 200): UseActivityFiltersResult {
  const [actions, setActions] = useState<ActivityAction[]>([]);
  const [actor, setActor] = useState<string>('');

  const filters = useMemo(
    () => ({
      actions: actions.length > 0 ? actions : undefined,
      actor: actor || undefined,
    }),
    [actions, actor],
  );

  const { data: entries = [], isLoading } = useActivity(limit, filters);

  // Counts/actors come from a query that ignores the action filter but
  // keeps the actor filter so the chip counts reflect the visible scope.
  const { data: scopeEntries = [] } = useActivity(limit, {
    actor: actor || undefined,
  });

  const counts = useMemo(() => countByAction(scopeEntries), [scopeEntries]);
  const actors = useMemo(() => uniqueActors(scopeEntries), [scopeEntries]);
  const grouped = useMemo(() => groupActions(), []);

  const toggleAction = useCallback((a: ActivityAction) => {
    setActions((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  }, []);

  const clearAction = useCallback((a: ActivityAction) => {
    setActions((prev) => prev.filter((x) => x !== a));
  }, []);

  const clearActions = useCallback(() => {
    setActions([]);
  }, []);

  const clearAll = useCallback(() => {
    setActions([]);
    setActor('');
  }, []);

  return {
    actions,
    actor,
    setActor,
    toggleAction,
    clearAction,
    clearActions,
    clearAll,
    hasFilters: actions.length > 0 || !!actor,
    grouped,
    counts,
    actors,
    entries,
    isLoading,
    resultCount: entries.length,
  };
}
