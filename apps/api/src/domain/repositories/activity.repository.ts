import { ActivityEntry } from '../entities/activity.entity';

export const ACTIVITY_REPOSITORY = Symbol('ACTIVITY_REPOSITORY');

export interface ActivityFilters {
  action?: string;
  actions?: string[];
  actor?: string;
  bucket?: string;
  provider?: string;
  from?: number;
  to?: number;
}

export interface IActivityRepository {
  log(entry: Omit<ActivityEntry, 'id' | 'createdAt'>): void;
  list(
    limit: number,
    offset: number,
    filters?: ActivityFilters,
  ): ActivityEntry[];
}
