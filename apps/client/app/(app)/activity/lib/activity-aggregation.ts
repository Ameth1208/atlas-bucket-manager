import {
  ALL_ACTIONS,
  getActionMeta,
  type ActionGroup,
  type ActivityAction,
} from './action-meta';

export const GROUP_ORDER: ActionGroup[] = ['storage', 'team', 'integrations'];

export function groupActions(): Record<ActionGroup, ActivityAction[]> {
  const groups: Record<ActionGroup, ActivityAction[]> = {
    storage: [],
    team: [],
    integrations: [],
  };
  for (const a of ALL_ACTIONS) {
    groups[getActionMeta(a).group].push(a);
  }
  return groups;
}

export function countByAction<T extends { action: string }>(
  entries: readonly T[],
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const e of entries) {
    map[e.action] = (map[e.action] ?? 0) + 1;
  }
  return map;
}

export function uniqueActors<T extends { actor: string }>(
  entries: readonly T[],
): string[] {
  const set = new Set<string>();
  for (const e of entries) if (e.actor) set.add(e.actor);
  return Array.from(set).sort();
}
