import { ActivityEntry } from '../entities/activity.entity';

export const ACTIVITY_REPOSITORY = Symbol('ACTIVITY_REPOSITORY');

export interface IActivityRepository {
  log(entry: Omit<ActivityEntry, 'id' | 'createdAt'>): void;
  list(limit: number, offset: number): ActivityEntry[];
}
